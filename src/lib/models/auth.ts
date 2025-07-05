export type AuthPathName = 'signin' | 'signup' | 'reset';

interface AuthConfig {
    heading: string;
    subheading: string;
    logo: {
        url: string;
        src: string;
        alt: string;
        title?: string;
    };
}

interface SignInConfig extends AuthConfig {
    loginText: string;
    googleText: string;
    signupText: string;
    signupUrl: string;
}

interface SignUpConfig extends AuthConfig {
    googleText: string;
    signupText: string;
    loginText: string;
    loginUrl: string;
}

interface ResetConfig extends AuthConfig {
    resetText?: string;
}

export type AuthRouteConfig = {
    signin: SignInConfig;
    signup: SignUpConfig;
    reset: ResetConfig;
    getPath: (pathName: AuthPathName) => string;
}

// Default configurations
const defaultLogo = {
    url: "https://www.shadcnblocks.com",
    src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
    alt: "Shadcnblocks",
    title: "shadcnblocks.com",
};

export const AuthModel: AuthRouteConfig = {
    signin: {
        heading: "Login",
        subheading: "Welcome back",
        logo: defaultLogo,
        loginText: "Log in",
        googleText: "Log in with Google",
        signupText: "Don't have an account?",
        signupUrl: "/auth/signup",
    },
    signup: {
        heading: "Signup",
        subheading: "Create a new account",
        logo: defaultLogo,
        googleText: "Sign up with Google",
        signupText: "Create an account",
        loginText: "Already have an account?",
        loginUrl: "/auth/signin",
    },
    reset: {
        heading: "Forgot Password?",
        subheading: "Follow the instructions to reset your password",
        logo: defaultLogo,
        resetText: "Reset Password",
    },
    getPath: (pathName: AuthPathName): string => {
        return `/auth/${pathName}`;
    }
};