import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Skill } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { BadgeSection } from "@/components/profile/badge-section";
import { ConnectionButton } from "@/components/connection/connection-button";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Pencil, 
  Plus, 
  X, 
  Save, 
  UploadCloud,
  Loader2,
  User as UserIcon,
  Building,
  GraduationCap,
  Briefcase,
  UserCheck
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Component for toggling mentor status
const ToggleMentorButton = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  
  const toggleMentorStatus = async () => {
    setIsPending(true);
    try {
      const response = await apiRequest("POST", "/api/user/toggle-mentor");
      const data = await response.json();
      
      // Update user data in cache
      queryClient.setQueryData(["/api/user"], data);
      
      toast({
        title: data.message,
        description: user.isMentor 
          ? "You will no longer appear as a mentor to others." 
          : "You are now available to mentor other members!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <Button 
      variant={user.isMentor ? "destructive" : "default"}
      onClick={toggleMentorStatus}
      disabled={isPending}
      className="w-full"
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <UserCheck className="mr-2 h-4 w-4" />
      {user.isMentor ? "Stop Mentoring" : "Become a Mentor"}
    </Button>
  );
};

// Create a schema for profile validation
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  major: z.string().optional(),
  graduationYear: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  company: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
  isAlumni: z.boolean().optional(),
  isStudent: z.boolean().optional(),
  isMentor: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  
  // Get user ID from URL if present, or fallback to the current user
  // The path format is /profile or /profile/:id
  const profileUserId = window.location.pathname.split('/').length > 2 
    ? parseInt(window.location.pathname.split('/')[2]) 
    : user?.id;
  
  // Is this the current user's profile?
  const isCurrentUserProfile = user?.id === profileUserId;
  
  // Get user skills
  const { data: userSkills = [], isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/users", user?.id, "skills"],
    enabled: !!user,
  });
  
  // Get all available skills for dropdown
  const { data: allSkills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });
  
  // Form setup
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isDirty },
    setValue,
    watch,
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      major: user?.major || "",
      graduationYear: user?.graduationYear ? user.graduationYear.toString() : "",
      company: user?.company || "",
      position: user?.position || "",
      bio: user?.bio || "",
      isAlumni: user?.isAlumni || false,
      isStudent: user?.isStudent || true,
      isMentor: user?.isMentor || false,
    }
  });
  
  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PUT", `/api/users/${user!.id}`, data);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for adding a skill
  const addSkillMutation = useMutation({
    mutationFn: async (skillName: string) => {
      // First check if skill exists, if not create it
      let skill = allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      
      if (!skill) {
        const createRes = await apiRequest("POST", "/api/skills", { name: skillName });
        skill = await createRes.json();
      }
      
      // Then add the skill to the user
      const res = await apiRequest("POST", `/api/users/${user!.id}/skills`, { skillId: skill.id });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "skills"] });
      setNewSkill("");
      toast({
        title: "Skill added",
        description: "The skill has been added to your profile.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add skill",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for removing a skill
  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      await apiRequest("DELETE", `/api/users/${user!.id}/skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "skills"] });
      toast({
        title: "Skill removed",
        description: "The skill has been removed from your profile.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove skill",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Initialize form with user data when it changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        major: user.major || "",
        graduationYear: user.graduationYear ? user.graduationYear.toString() : "",
        company: user.company || "",
        position: user.position || "",
        bio: user.bio || "",
        isAlumni: user.isAlumni,
        isStudent: user.isStudent,
        isMentor: user.isMentor || false,
      });
    }
  }, [user, reset]);
  
  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };
  
  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    addSkillMutation.mutate(newSkill.trim());
  };
  
  const handleRemoveSkill = (skillId: number) => {
    removeSkillMutation.mutate(skillId);
  };
  
  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0;
    
    const requiredFields = [
      'firstName', 'lastName', 'email', 'major', 
      'graduationYear', 'company', 'position', 'bio'
    ];
    
    const completedFields = requiredFields.filter(field => !!user[field as keyof typeof user]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };
  
  const profileCompletion = getProfileCompletion();
  
  // Current form values
  const formValues = watch();
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
              <p className="text-slate-500 mt-1">
                Update your information and manage your account
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              {/* Only show edit button on own profile */}
              {isCurrentUserProfile && (
                isEditing ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit(onSubmit)}
                      disabled={!isDirty || updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={user?.profilePicture || ""} 
                          alt={`${user?.firstName} ${user?.lastName}`} 
                        />
                        <AvatarFallback className="text-lg">
                          {user ? getInitials(user.firstName, user.lastName) : "AC"}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="absolute bottom-0 right-0 rounded-full bg-white"
                        >
                          <UploadCloud className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mt-4">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-slate-500">{user?.email}</p>
                    
                    <div className="flex space-x-2 mt-2">
                      {user?.isAlumni && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
                          Alumni
                        </Badge>
                      )}
                      {user?.isStudent && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                          Student
                        </Badge>
                      )}
                      {user?.isMentor && (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">
                          Mentor
                        </Badge>
                      )}
                    </div>
                    
                    {/* Show connection button if viewing someone else's profile */}
                    {!isCurrentUserProfile && profileUserId && (
                      <div className="mt-4">
                        <ConnectionButton 
                          userId={profileUserId} 
                        />
                      </div>
                    )}
                    
                    {/* Show mentor toggle button if this is the user's own profile AND they are an alumni */}
                    {isCurrentUserProfile && user?.isAlumni && (
                      <div className="mt-4">
                        <ToggleMentorButton user={user} />
                      </div>
                    )}
                    
                    <div className="w-full mt-6">
                      <div className="flex justify-between text-sm">
                        <span>Profile completion</span>
                        <span>{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} className="h-2 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="px-6 py-5 border-b border-slate-200">
                  <CardTitle className="text-lg font-bold text-slate-800">Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {skillsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : userSkills.length === 0 && !isEditing ? (
                    <div className="text-center py-4">
                      <p className="text-slate-500 mb-2">No skills added yet.</p>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Skills
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {userSkills.map((skill) => (
                          <Badge 
                            key={skill.id} 
                            variant="secondary"
                            className="bg-primary-100 text-primary-800 hover:bg-primary-200 flex items-center"
                          >
                            {skill.name}
                            {isEditing && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                                onClick={() => handleRemoveSkill(skill.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      
                      {isEditing && (
                        <div className="flex mt-4">
                          <Input
                            placeholder="Add a new skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="mr-2"
                            list="skills-list"
                          />
                          <datalist id="skills-list">
                            {allSkills.map(skill => (
                              <option key={skill.id} value={skill.name} />
                            ))}
                          </datalist>
                          <Button 
                            onClick={handleAddSkill}
                            disabled={!newSkill.trim() || addSkillMutation.isPending}
                          >
                            {addSkillMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Badge Section */}
              <div className="mt-6">
                <BadgeSection userId={profileUserId || 0} isCurrentUser={isCurrentUserProfile} />
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="px-6 py-5 border-b border-slate-200">
                  <CardTitle className="text-xl font-bold text-slate-800">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium flex items-center">
                          <UserIcon className="mr-2 h-5 w-5 text-primary" />
                          Personal Information
                        </h3>
                        <p className="text-sm text-slate-500">
                          Basic information about your account
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            {...register("firstName")}
                            readOnly={!isEditing}
                            className={!isEditing ? 'bg-slate-50' : ''}
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            {...register("lastName")}
                            readOnly={!isEditing}
                            className={!isEditing ? 'bg-slate-50' : ''}
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-slate-50' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm">{errors.email.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1 pt-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                          Education
                        </h3>
                        <p className="text-sm text-slate-500">
                          Your academic background
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            {...register("major")}
                            readOnly={!isEditing}
                            className={!isEditing ? 'bg-slate-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Graduation Year</Label>
                          <Input
                            id="graduationYear"
                            type="number"
                            {...register("graduationYear")}
                            readOnly={!isEditing}
                            className={!isEditing ? 'bg-slate-50' : ''}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 pt-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Briefcase className="mr-2 h-5 w-5 text-primary" />
                          Professional Information
                        </h3>
                        <p className="text-sm text-slate-500">
                          Your current job and company
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            {...register("company")}
                            readOnly={!isEditing}
                            className={!isEditing ? 'bg-slate-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            {...register("position")}
                            readOnly={!isEditing}
                            className={!isEditing ? 'bg-slate-50' : ''}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          {...register("bio")}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-slate-50 h-32' : 'h-32'}
                          placeholder="Tell us about yourself, your interests, and expertise"
                        />
                      </div>
                      
                      {isEditing && (
                        <div className="space-y-1 pt-4">
                          <h3 className="text-lg font-medium flex items-center">
                            <Building className="mr-2 h-5 w-5 text-primary" />
                            Account Type
                          </h3>
                          <p className="text-sm text-slate-500">
                            Select your relationship with the university
                          </p>
                          
                          <div className="space-y-3 mt-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isAlumni"
                                checked={formValues.isAlumni}
                                onCheckedChange={(checked) => setValue("isAlumni", checked, { shouldDirty: true })}
                              />
                              <Label htmlFor="isAlumni">I'm an alumnus/alumna</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isStudent"
                                checked={formValues.isStudent}
                                onCheckedChange={(checked) => setValue("isStudent", checked, { shouldDirty: true })}
                              />
                              <Label htmlFor="isStudent">I'm a current student</Label>
                            </div>
                            
                            {/* Only show mentor option for alumni */}
                            {formValues.isAlumni && (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="isMentor"
                                  checked={formValues.isMentor || false}
                                  onCheckedChange={(checked) => setValue("isMentor", checked, { shouldDirty: true })}
                                />
                                <Label htmlFor="isMentor">I want to mentor others</Label>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              {/* Only show Account Settings on user's own profile */}
              {isCurrentUserProfile && (
                <Card className="mt-6">
                  <CardHeader className="px-6 py-5 border-b border-slate-200">
                    <CardTitle className="text-lg font-bold text-slate-800">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium">Change Password</h3>
                          <p className="text-sm text-slate-500">Update your password for security</p>
                        </div>
                        <Button variant="outline">Change Password</Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium">Notification Settings</h3>
                          <p className="text-sm text-slate-500">Manage your email notifications</p>
                        </div>
                        <Button variant="outline">Manage</Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium text-red-600">Delete Account</h3>
                          <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Account</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
