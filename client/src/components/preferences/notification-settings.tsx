import React, { useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  enabled: boolean;
  threshold: number;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  settings, 
  onUpdate 
}) => {
  const form = useForm<NotificationSettings>({
    defaultValues: settings
  });
  
  const { toast } = useToast();
  
  // Get the enabled value to conditionally render other settings
  const notificationsEnabled = form.watch('enabled');
  
  const handleSubmit = (data: NotificationSettings) => {
    onUpdate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Enable Notifications
                </FormLabel>
                <FormDescription>
                  Receive alerts about library occupancy
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
        
        {notificationsEnabled && (
          <>
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupancy Threshold</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        value={[field.value]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>10%</span>
                        <span className="font-medium text-primary">{field.value}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    You will be notified when occupancy drops below this threshold
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-medium">Notification Channels</h3>
              
              <FormField
                control={form.control}
                name="push"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <FormLabel className="text-sm">Push Notifications</FormLabel>
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
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <FormLabel className="text-sm">Email Notifications</FormLabel>
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
              
              <FormField
                control={form.control}
                name="sms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <FormLabel className="text-sm">SMS Notifications</FormLabel>
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
          </>
        )}
        
        <div className="flex justify-end">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </Form>
  );
};

export default NotificationSettings;
