import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import MicrosoftLoginButton from '@/components/microsoft-login-button';
import CuLogo from '@/assets/icons/CuLogo';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [_, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would trigger Microsoft OAuth
      // For demo purposes, we'll simulate a successful login
      await login({
        email: '6XXXXXXXX@student.chula.ac.th',
        microsoftId: 'ms-123456',
        name: 'Somchai P.',
        studentId: '6XXXXXXXX'
      });
      
      toast({
        title: 'Login successful',
        description: 'Welcome to the CU Library Tracker',
      });
      
      onLogin();
      navigate('/');
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <CuLogo className="h-12 w-12" />
        </div>
        <h2 className="mt-4 text-3xl font-bold font-heading text-gray-900">
          Engineering Library Tracker
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Find available seats, track occupancy, and more
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Use your Chulalongkorn University account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <MicrosoftLoginButton 
              onClick={handleMicrosoftLogin} 
              loading={loading}
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Demo Information
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              <p>This is a demonstration of the Chulalongkorn Engineering Library Occupancy Tracker.</p>
              <p className="mt-1">Click the Microsoft button to sign in with the demo account.</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to the{" "}
            <a href="#" className="text-primary hover:text-primary-dark">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:text-primary-dark">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
