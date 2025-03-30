import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema, insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Extended register schema with confirmPassword
const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form setup for login
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form setup for registration
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      isAlumni: false,
      isStudent: true,
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  // Handle registration submission
  const onRegisterSubmit = (data: RegisterData) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-6xl">
        <Card className="w-full">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {/* Left Column - Forms */}
              <div className="p-6 md:p-8">
                <div className="mb-6 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-primary">AlumniConnect</h1>
                  <p className="text-slate-500 mt-2">
                    Connect with alumni and students from your alma mater
                  </p>
                </div>

                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login">
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="Enter your username"
                            {...loginForm.register("username")}
                          />
                          {loginForm.formState.errors.username && (
                            <p className="text-red-500 text-sm mt-1">
                              {loginForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            {...loginForm.register("password")}
                          />
                          {loginForm.formState.errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                              {loginForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Login
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register">
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              placeholder="John"
                              {...registerForm.register("firstName")}
                            />
                            {registerForm.formState.errors.firstName && (
                              <p className="text-red-500 text-sm mt-1">
                                {registerForm.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              {...registerForm.register("lastName")}
                            />
                            {registerForm.formState.errors.lastName && (
                              <p className="text-red-500 text-sm mt-1">
                                {registerForm.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            {...registerForm.register("email")}
                          />
                          {registerForm.formState.errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {registerForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="johndoe"
                            {...registerForm.register("username")}
                          />
                          {registerForm.formState.errors.username && (
                            <p className="text-red-500 text-sm mt-1">
                              {registerForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="******"
                            {...registerForm.register("password")}
                          />
                          {registerForm.formState.errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="******"
                            {...registerForm.register("confirmPassword")}
                          />
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Register
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Hero */}
              <div className="hidden md:block bg-gradient-to-r from-primary to-secondary-500 p-8 text-white">
                <div className="h-full flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-4">Welcome to AlumniConnect</h2>
                  <p className="text-lg mb-6">
                    Join our community of graduates and students to build meaningful connections.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                        ✓
                      </div>
                      <span>Connect with alumni from your field</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                        ✓
                      </div>
                      <span>Find mentors to guide your career path</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                        ✓
                      </div>
                      <span>Discover exclusive job opportunities</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                        ✓
                      </div>
                      <span>Participate in alumni events and networks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
