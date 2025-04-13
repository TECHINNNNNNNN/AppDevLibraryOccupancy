import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Clock, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LibraryZone } from "@/assets/library-map";
import ImageUploader from "./image-uploader";

const formSchema = z.object({
  zone: z.string({
    required_error: "Please select a library zone",
  }),
  seatId: z.string().optional(),
  message: z.string().max(200, "Message cannot exceed 200 characters").optional(),
  duration: z.number().min(15).max(480),
  groupSize: z.number().min(1).max(10),
  isAnonymous: z.boolean().default(false),
  imageUrl: z.string().optional(),
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  zones: LibraryZone[];
}

const CreatePost: React.FC<CreatePostProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  zones 
}) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zone: "",
      seatId: "",
      message: "",
      duration: 120, // 2 hours
      groupSize: 1,
      isAnonymous: false,
      coordinates: { x: 0, y: 0 }
    },
  });
  
  const handleImageChange = (file: File | null, imageUrl: string | null) => {
    setUploadedImage(file);
    form.setValue("imageUrl", imageUrl || '');
  };
  
  const handleSubmit = (values: FormValues) => {
    // In a real app, we would upload the image first then submit the form
    // with the uploaded image URL
    
    // For demo purposes, we'll just pass the image data URL
    // In production, you'd upload to Firebase Storage or similar
    onSubmit(values);
    form.reset();
    setUploadedImage(null);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Share a Seat</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Seat Image</FormLabel>
                    <FormControl>
                      <ImageUploader onImageChange={handleImageChange} maxSize={2} />
                    </FormControl>
                    <FormDescription>
                      Add a photo to help others find this seat (max 2MB)
                    </FormDescription>
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Library Zone</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={`Zone ${String.fromCharCode(64 + zone.id)}`}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="seatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seat/Table ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A12, Table 3" {...field} />
                    </FormControl>
                    <FormDescription>
                      If available, provide the seat or table identifier
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coordinates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Coordinates (Optional)</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="X" 
                            value={field.value?.x || ''} 
                            onChange={(e) => {
                              field.onChange({
                                ...field.value,
                                x: parseInt(e.target.value) || 0
                              });
                            }}
                          />
                        </FormControl>
                      </div>
                      <div>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Y" 
                            value={field.value?.y || ''}
                            onChange={(e) => {
                              field.onChange({
                                ...field.value,
                                y: parseInt(e.target.value) || 0
                              });
                            }}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormDescription>
                      If you know the coordinates on the library map
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information about this seat/area..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="flex justify-end">
                      {field.value?.length || 0}/200
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Duration
                      </FormLabel>
                      <div className="pt-2">
                        <Slider
                          value={[value]}
                          min={15}
                          max={480}
                          step={15}
                          onValueChange={(vals) => onChange(vals[0])}
                        />
                      </div>
                      <FormDescription>
                        {Math.floor(value / 60)}h {value % 60 > 0 ? `${value % 60}m` : ''}
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="groupSize"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Group Size
                      </FormLabel>
                      <div className="pt-2">
                        <Slider
                          value={[value]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(vals) => onChange(vals[0])}
                        />
                      </div>
                      <FormDescription>
                        {value} {value === 1 ? 'person' : 'people'}
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Post Anonymously</FormLabel>
                      <FormDescription>
                        Your name and profile will not be displayed
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Share Seat</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
