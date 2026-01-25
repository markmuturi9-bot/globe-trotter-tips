import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Auth() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isSignUp) {
        if (!acceptedTerms) {
          setErrors({ terms: "You must accept the terms to sign up" });
          setLoading(false);
          return;
        }
        
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.username);

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome to TIPIT!",
            description: "Your account has been created successfully.",
          });
          navigate("/");
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          if (error.message.includes("Invalid login")) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign in failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/10 via-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 mb-5 shadow-lg shadow-primary/25">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">TIPIT</h1>
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Share your travel tips with the world
          </p>
        </div>

        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/80 animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
              <Button 
                variant={!isSignUp ? "default" : "ghost"} 
                className={`flex-1 ${!isSignUp ? '' : 'hover:bg-background/50'}`}
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </Button>
              <Button 
                variant={isSignUp ? "default" : "ghost"} 
                className={`flex-1 ${isSignUp ? '' : 'hover:bg-background/50'}`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="tipsare"
                  />
                  {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{isSignUp ? 'Email' : 'Email or Username'}</Label>
                <Input
                  id="email"
                  type={isSignUp ? 'email' : 'text'}
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder={isSignUp ? 'you@example.com' : 'Email or username'}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline font-medium" target="_blank">
                        Terms of Service
                      </Link>{' '}
                      (including{' '}
                      <Link to="/terms#ugc" className="text-primary hover:underline font-medium" target="_blank">
                        UGC Policy
                      </Link>
                      ) and{' '}
                      <Link to="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          By using the service, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-primary hover:underline">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}