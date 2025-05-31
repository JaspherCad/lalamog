import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthProvider';
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
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
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






export function useProfiles(context: string) {
    const { session, isLoading } = useAuth()
  
  const hasSubscribed = useRef(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);


  //already matched, can be PASSED for message views and to filter out the NOTmathcedProfiles
  const [matchedProfiles, setMatchedProfiles] = useState<Profile[]>([]);



  const [fetching, setFetching] = useState(false);







   const updateProfileToFix = async (updates: Partial<Profile>) => {
    try{
    const { error } = await supabase
      .from('profiles')
      .upsert(updates);

    return error;

    }catch(error){
      console.log(error)
    }
    

  }

  const updatePictureProfileToFix = async (publicUrl: string, userId: string) => {
    try{
    const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', userId)

    return updateError;

    }catch(error){
      console.log(error)
    }
    

  }






const load = async () => {
      try {
        if (!session) {
      setProfiles([]);
      return;
    }




        //🎯vstep 1: FETCH ALL profiles
        setFetching(true);
        const { data: profilesData, error: profilesError } = await supabase
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


        if (profilesError) throw profilesError;



        //🎯STEP 2: fetch from matchedTable if swiper/swipee is matching my id
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('user1_id, user2_id')
          //.eq('status', 'active') ===> soon maybe we need 
          .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`);

        if (matchesError) throw matchesError;


        //🎯vSTEP 3: get the ids of matched users (to filter out in next steps) of course exept my id
        const matchedUserIds = matchesData
          .map(match => {
            if (match.user1_id === session.user.id) return match.user2_id;
            return match.user1_id;
          })
          .filter(Boolean);



        //🎯step 4 :plit profiles into matched and not-matched

        //Filter out matched profiles from ALL PROFILES
        const matched = profilesData.filter(profile =>
          matchedUserIds.includes(profile.id)
        );

        const notMatched = profilesData.filter(profile =>
          !matchedUserIds.includes(profile.id)
        );

   




        //deprecated code: HIDE || still save for refernce
        //geocode only not mached.. note for me WHY? Faster initial load: 
          //nonsense naman i geo load pa natin matched i guess?? mabagal kasi.

      //DEPRECATED CODE still savev

                                      //   const profilesWithAddresses = await Promise.all(
                                      //   notMatched.map(async (profile: any) => {
                                      //     const lat = parseFloat(profile.latitude);
                                      //     const lng = parseFloat(profile.longitude);
                                      //     const address = await reverseGeocode(lat, lng);
                                      //     return { ...profile, address };
                                      //   })
                                      // );

                                      // //sv🎯tep 6: Update state
                                      // setProfiles(profilesWithAddresses);
                                      // setMatchedProfiles(matched);

                                      
         const addAddress = async (profiles: Profile[]) => {
          return Promise.all(
            profiles.map(async (profile) => {
              const lat = parseFloat(profile.latitude);
              const lng = parseFloat(profile.longitude);
              try {
                const address = await reverseGeocode(lat, lng);
                return { ...profile, address };
              } catch (err) {
                console.warn(`Failed to geocode profile ${profile.id}`, err);
                return profile; 
              }
            })
          );
        };

        //sv🎯tep 6: Update state
                              //❌geocode only not mached.. note for me WHY? Faster initial load:
        const profilesWithAddresses = await addAddress(notMatched);   //await addAddress(matched);
                              

        setProfiles(profilesWithAddresses);
        setMatchedProfiles(matched);


      } catch (err: any) {
        Alert.alert('Error loading profiles', err.message);
      } finally {
        setFetching(false);
      }
    };









    



    //two ways to trigger load
      //on session change
      //on websocket
  





  //on session change
  useEffect(() => {
    load();
  }, [session]);





  //on websocket
  
  // useEffect(() => {
  //   if (!session || hasSubscribed.current) return;

  //   const channel = supabase
  //     .ch('matches-changes')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: 'INSERT',
  //         schema: 'public',
  //         table: 'matches',
  //       },
  //       (payload) => {
  //         const match = payload.new;
  //         if (
  //           match.user1_id === session.user.id ||
  //           match.user2_id === session.user.id
  //         ) {
  //           load();//refetchd
  //         }
  //       }
  //     )
  //     .on(
  //     'postgres_changes',
  //     {
  //       event: 'DELETE',
  //       schema: 'public',
  //       table: 'matches',
  //     },(payload) => {
  //       const deletedMatch = payload.old;
  //         if (
  //         deletedMatch?.user1_id === session.user.id ||
  //         deletedMatch?.user2_id === session.user.id
  //       ) {
  //           load();//refetchd
  //         }
  //       }
  //     )
  //     .subscribe();

  //   hasSubscribed.current = true;

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [session]);


useEffect(() => {
  if (!session || hasSubscribed.current) return;

  // const channelName = `matches-changes-${session.user.id}`;
  const channel = supabase
    .channel(`matches-changes-${context}-${session.user.id}`) 
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `or=(user1_id.eq.${session.user.id},user2_id.eq.${session.user.id})`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          Alert.alert('New match!', 'You matched with someone!', [{ text: 'OK' }]);
        } else if (payload.eventType === 'DELETE') {
          Alert.alert('Match removed', 'Someone unmatched with you', [{ text: 'OK' }]);
        }
        load();
      }
    )
    .subscribe();

  hasSubscribed.current = true;

  return () => {
    supabase.removeChannel(channel);
    hasSubscribed.current = false;
  };
}, [session, context]);

  






  // useEffect(() => {
  //   if (!session || hasSubscribed.current) return;

  //   const channel = supabase
  //     .ch('matches-changes')
  //     .on(
  //     'postgres_changes',
  //     {
  //       event: 'DELETE',
  //       schema: 'public',
  //       table: 'matches',
  //     },(payload) => {
  //       const deletedMatch = payload.old;
  //         if (
  //         deletedMatch?.user1_id === session.user.id ||
  //         deletedMatch?.user2_id === session.user.id
  //       ) {
  //           load();//refetchd
  //         }
  //       }
  //     )
  //     .subscribe();

  //   hasSubscribed.current = true;

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [session]);


  


  return { profiles, matchedProfiles, fetching, updateProfileToFix, updatePictureProfileToFix };
}














































// import type { Session } from '@supabase/supabase-js';
// import { useEffect, useState } from 'react';
// import { Alert } from 'react-native';
// import { supabase } from './supabase';

// export type Profile = {
//   id: string;
//   username: string;
//   full_name: string;
//   avatar_url: string | null;
//   bio: string | null;
//   fighting_style: string | null;
//   experience_level: number | null;
//   availability: { days: string[]; time: string } | null;
//   latitude: string;
//   longitude: string;
//   address?: string;

// };




// //helper function for getting actual address rather than numerics FReE?? idk try
// async function reverseGeocode(lat: number, lng: number) {
//   const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=   ${lat}&lon=${lng}&zoom=18&addressdetails=1`;
//   const response = await fetch(url, {
//     headers: { 'User-Agent': 'MyApp/1.0' } // Required by OSM
//   });
//   const data = await response.json();

//   const address = data.address;

//   const parts = [
//     address.road,
//     address.suburb,
//     address.city || address.town || address.village,
//     address.state,
//     address.country,
//   ].filter(Boolean);

//   return parts.join(', ');
// }



// export function useProfiles(session: Session | null) {
//   const [profiles, setProfiles] = useState<Profile[]>([]);
//   const [fetching, setFetching] = useState(false);

//   useEffect(() => {
//     if (!session) {
//       setProfiles([]);
//       return;
//     }

    

//     const load = async () => {
//       try {
//         setFetching(true);
//         const { data, error } = await supabase
//           .from('profiles')
//           .select(`
//             id,
//             username,
//             full_name,
//             avatar_url,
//             latitude,
//             longitude,
//             bio,
//             fighting_style,
//             experience_level,
//             availability
//           `)
//           .neq('id', session.user.id);

//         if (error) throw error;



//         const profilesWithAddresses = await Promise.all(
//           data.map(async (profile: any) => {
//             const lat = parseFloat(profile.latitude);
//             const lng = parseFloat(profile.longitude);
//             const address = await reverseGeocode(lat, lng);
//             return { ...profile, address };
//           })
//         );

//         setProfiles(profilesWithAddresses);


//       } catch (err: any) {
//         Alert.alert('Error loading profiles', err.message);
//       } finally {
//         setFetching(false);
//       }
//     };

//     load();
//   }, [session]);

//   return { profiles, fetching };
// }


