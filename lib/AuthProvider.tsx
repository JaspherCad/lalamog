//ERROR: Warning: tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance

import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

interface AuthContextType {
    session: Session | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const mounted = useRef(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted.current) {
                setSession(session);
                setIsLoading(false);
            }
        };

        const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
            if (mounted.current) {
                setSession(session);
            }
        });

        getSession();

        return () => {
            mounted.current = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);