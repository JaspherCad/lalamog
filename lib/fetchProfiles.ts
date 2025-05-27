import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from './supabase';

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  fighting_style: string | null;
  experience_level: number | null;
  availability: { days: string[]; time: string } | null;
  latitude: string;
  longitude: string;
  address?: string;

};




//helper function for getting actual address rather than numerics FReE?? idk try
async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat= ${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'MyApp/1.0' } // Required by OSM
  });
  const data = await response.json();

  const address = data.address;

  const parts = [
    address.road,
    address.suburb,
    address.city || address.town || address.village,
    address.state,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}



export function useProfiles(session: Session | null) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!session) {
      setProfiles([]);
      return;
    }

    

    const load = async () => {
      try {
        setFetching(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            avatar_url,
            latitude,
            longitude,
            bio,
            fighting_style,
            experience_level,
            availability
          `)
          .neq('id', session.user.id);

        if (error) throw error;



        const profilesWithAddresses = await Promise.all(
          data.map(async (profile: any) => {
            const lat = parseFloat(profile.latitude);
            const lng = parseFloat(profile.longitude);
            const address = await reverseGeocode(lat, lng);
            return { ...profile, address };
          })
        );

        setProfiles(profilesWithAddresses);


      } catch (err: any) {
        Alert.alert('Error loading profiles', err.message);
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [session]);

  return { profiles, fetching };
}