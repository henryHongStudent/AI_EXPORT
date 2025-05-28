import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // 환경변수에서 불러오기

export const handler = async (event) => {
  console.log("============================================")
  console.log("event", event)
  console.log("============================================")
  try {
    // TOKEN 타입 Authorizer는 authorizationToken 필드 사용!
    const authHeader = event.authorizationToken || '';
    console.log('authHeader:', authHeader);
    console.log('JWT_SECRET:', JWT_SECRET);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return generatePolicy('user', 'Deny', event.methodArn);
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    return generatePolicy(decoded.userID, 'Allow', event.methodArn);
  } catch (error) {
    console.error('Token verification failed:', error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

function generatePolicy(principalId, effect, resource) {
  const authResponse = { principalId };
  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    };
  }
  authResponse.context = { userID: principalId };
  return authResponse;
}