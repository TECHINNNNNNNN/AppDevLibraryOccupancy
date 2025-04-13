import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import MicrosoftLoginButton from '@/components/microsoft-login-button';
import CuLogo from '@/assets/icons/CuLogo';
import { useAuth } from '@/lib/auth';

const Login = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { loginWithMicrosoft, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loginWithMicrosoft();
      
      toast({
        title: 'Login successful',
        description: 'Welcome to the CU Library Tracker',
      });
      
      navigate('/');
    } catch (err: any) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Handle specific errors
      if (err.message?.includes('Chulalongkorn University accounts')) {
        errorMessage = 'Only Chulalongkorn University (@student.chula.ac.th) accounts are allowed.';
      } else if (err.message?.includes('user canceled')) {
        errorMessage = 'Login was canceled.';
      }
      
      setError(errorMessage);
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
              loading={loading || authLoading}
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Information
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              <p>Only Chulalongkorn University student accounts (@student.chula.ac.th) are allowed to sign in.</p>
              <p className="mt-1">The student ID will be extracted from your email address.</p>
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
