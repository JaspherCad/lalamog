// app/index.tsx
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';


export default function Index() {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log(`INDEX --- am i loading?: ${isLoading}`)
    //uncommment this shit if error wtf!
    if (isLoading) return
    
    if (session) {
      router.replace('/(tabs)')
    } else {
      router.replace('/Auth')
    }
    console.log(`INDEX --- am i loading?: ${isLoading}`)
  }, [session, isLoading ])

  return null 
}



