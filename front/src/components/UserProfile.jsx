import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  Upload 
} from "lucide-react";

const UserProfile = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Use UI Avatars as default fallback
  const [profileImage, setProfileImage] = useState("https://ui-avatars.com/api/?name=User&background=6d28d9&color=fff");
  const [profile, setProfile] = useState({
    name: "Test User",
    email: "user@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, Country",
    company: "Example Corp",
    joinDate: "January 2023"
  });
  
  const [formData, setFormData] = useState({...profile});
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfile({...formData});
    }
    setIsEditing(!isEditing);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to generate avatar URL from name
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6d28d9&color=fff`;
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-md rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">User Profile</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              &times;
            </Button>
          </div>
          
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getAvatarUrl(profile.name);
                  }}
                />
              </div>
              {isEditing && (
                <label 
                  htmlFor="profile-image" 
                  className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
                >
                  <Upload size={16} />
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User size={16} className="text-primary" /> Name
              </Label>
              {isEditing ? (
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="mt-1"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.name}</p>
              )}
            </div>
            
            {/* Email (non-editable) */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} className="text-primary" /> Email
              </Label>
              <p className="text-foreground mt-1 pl-6">{profile.email}</p>
              {isEditing && (
                <p className="text-xs text-muted-foreground pl-6">Email cannot be changed</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={16} className="text-primary" /> Phone
              </Label>
              {isEditing ? (
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="mt-1"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.phone}</p>
              )}
            </div>
            
            {/* Address */}
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Address
              </Label>
              {isEditing ? (
                <Input 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="mt-1"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.address}</p>
              )}
            </div>
            
            {/* Company */}
            <div>
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building size={16} className="text-primary" /> Company
              </Label>
              {isEditing ? (
                <Input 
                  id="company" 
                  name="company" 
                  value={formData.company} 
                  onChange={handleChange} 
                  className="mt-1"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.company}</p>
              )}
            </div>
            
            {/* Join Date (read-only) */}
            <div>
              <Label className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Member Since
              </Label>
              <p className="text-foreground mt-1 pl-6">{profile.joinDate}</p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              {isEditing ? "Cancel" : "Close"}
            </Button>
            <Button 
              onClick={handleEditToggle}
              variant={isEditing ? "default" : "outline"}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 