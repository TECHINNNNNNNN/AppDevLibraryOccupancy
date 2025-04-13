import React, { useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from 'lucide-react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  studentId: z.string().min(8, { message: "Student ID should be at least 8 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).endsWith("@student.chula.ac.th", { message: "Email must be a Chulalongkorn University email." }),
  program: z.string().min(1, { message: "Please select your program." }),
  profileImage: z.string().optional(),
});

interface UserProfileFormProps {
  profile: z.infer<typeof profileSchema>;
  onUpdate: (values: z.infer<typeof profileSchema>) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ profile, onUpdate }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(profile.profileImage || null);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("profileImage", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {imagePreview ? (
                <AvatarImage src={imagePreview} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary text-white text-xl">
                  {form.getValues("name").charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <label 
              htmlFor="profile-image" 
              className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
            >
              <Camera className="h-4 w-4" />
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          
          <div className="w-full space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Industrial Engineering">Industrial Engineering</SelectItem>
                        <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormDescription>
                    Must be your Chulalongkorn University email (@student.chula.ac.th)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-end">
          <Button type="submit">Update Profile</Button>
        </div>
      </form>
    </Form>
  );
};

export default UserProfileForm;
