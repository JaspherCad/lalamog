import CustomHeader from '@/Components/CustomHeader';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Session } from '@supabase/supabase-js';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  const [session, setSession] = useState<Session | null>(null)
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
    }, [])
  
    
  return (
    <>
      <CustomHeader />
      
      
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'blue'


      }}>

        <Tabs.Screen
          name="index"
          options={{
            title: 'Matching',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settingsTab"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
