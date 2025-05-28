import SwipeCard, { SwipeCardHandle } from '@/Components/MyOwnSwipeCard';
import { useProfiles } from '@/lib/fetchProfiles';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect } from 'expo-router';
import React, { useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';





//psdcd
//create recordSwipe function for each swipe
// create table swipe_actions (
//   id bigserial primary key,
//   swiper_id uuid references public.profiles not null,
//   swipee_id uuid references public.profiles not null,
//   direction text not null check (direction in ('right', 'left')),
//   created_at timestamp with time zone default now(),
//   unique(swiper_id, swipee_id)
// );

// const handleSwipeLeft = async (index: number) => {
//     const profile = sampleProfiles[index]
//     await recordSwipe(profile.id, 'left')
//   }

//   const handleSwipeRight = async (index: number) => {
//     const profile = sampleProfiles[index]
//     await recordSwipe(profile.id, 'right')
//   }


//where recordSwipe must call supabase.from('swipe_actions').insert(
//  swiper_id === session.user.id
//  swipee === target.id
//  directio ... easy to)

//remove the swiped swipee 
//setSampleProfiles(prev => prev.filter(currentSelectedProfile => currentSelectedProfile.id !== swipeeId))





//step 2
//since we already have listener that detects manual swipe, we can listen on it
//useEffect + .channel

// step 3 
//FETCH that matches from the table itslef
//supabase.from(matches).select.... //get
//if (data) setMatches(data)




//but how should they connect?

































export default function Home() {

  const { session, isLoading } = useAuth();

  const { profiles, fetching } = useProfiles(session) //all profiles except session.user.id


  //TODO : filter the profiles here 
      //-> useEffect then show only profiles that are not yet matched with me
      //get the id of all MATCHED users
      //exclude those MATCHED users.









      


  const swipeRef = useRef<SwipeCardHandle>(null);
  //fetch all the list in 'profiles' table where important column to get are
  //username, full_name, avatar_url, location (geography: 0101000020E6100000BC26FFEEF84B5E40BEE1992BDE2B2D40), bio, fighting_style, experience_level (1: beginner 2: intermediate, 3: expert), availability (jsonb example {"days": ["Fri"], "time": "0:47-9:47"})
  const sampleProfiles = [

  ];

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/Auth" />;
  }





  //📌index: number is not id => it's just helper for POSITION[index] because the count of POSITIONS
  //is solely based on given PROFILES.lenght. so define the ID here like profiles[index] (so 0-n)
  const handleSwipeLeft = async (index: number) => {
    const profile = profiles[index]
    console.log(`🥊Swiped left on card ${profile.id}`);
    await recordSwipe(profile.id, 'left')
  };

  const handleSwipeRight = async (index: number) => {
    const profile = profiles[index]
    console.log(`🥊Swiped right on card ${profile.id}`);
    await recordSwipe(profile.id, 'right')


  };

  const recordSwipe = async (swipeeId: string, direction: 'left' | 'right') => {
    if (!session?.user) return

    const { error } = await supabase
      .from('swipe_actions')
      .insert({
        swiper_id: session.user.id,
        swipee_id: swipeeId,
        direction,
      })


      if (error) {
      console.error('Swipe failed:', error.message)
      return
    }

    // Optional: Remove swiped profile from list
    //setProfiles(prev => prev.filter(p => p.id !== swipeeId))
  }


  // type SwipeCardProps <T extends { id: string }> = {
  //     data:  T[]; 
  //     //data: { id: string }[]; without <T></T>
  //     cardSize?: { width: number; height: number };   
  //     swipeThreshold?: number;
  //     cardStyle?: StyleProp<ViewStyle>;
  //     renderNoMoreCards?: () => React.ReactNode;
  //     customRender?: (item: T) => React.ReactNode;
  //     onSwipeLeft?: (cardIndex: number) => void;
  //     onSwipeRight?: (cardIndex: number) => void;
  //     customPreviewRender?: (item: T) => React.ReactNode;
  // }





  return (

    <View style={styles.wrapper}>


      <View style={styles.container}>
        <SwipeCard
          ref={swipeRef}
          data={profiles}
          cardSize={{ width: 300, height: 400 }}
          swipeThreshold={150}
          cardStyle={{ borderRadius: 15 }}
          customPreviewRender={(currentSelectedProfile) => {
            return (

              <Image source={{ uri: currentSelectedProfile.avatar_url }} style={styles.image} />
            )
          }}
          customRender={(p) => {
            const levelLabel =
              p.experience_level === 1
                ? 'Beginner'
                : p.experience_level === 2
                  ? 'Intermediate'
                  : p.experience_level === 3
                    ? 'Expert'
                    : '—';

            return (
              <View style={styles.card}>
                {p.avatar_url ? (
                  <Image source={{ uri: p.avatar_url }} style={styles.image} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text>No Avatar</Text>
                  </View>
                )}

                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{p.username}</Text>
                  {p.bio && <Text style={styles.bio}>{p.bio}</Text>}

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{p.fighting_style || 'Style: —'}</Text>
                    <Text style={styles.metaText}>Lvl: {levelLabel}</Text>
                  </View>

                  {p.availability?.days && (
                    <View style={styles.daysContainer}>
                      {p.availability.days.map((day: string) => (
                        <View key={day} style={styles.dayPill}>
                          <Text style={styles.dayText}>{day}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {p.address && (
                    <Text style={styles.location}>
                      📍 {p.address}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}

          renderNoMoreCards={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No more profiles!</Text>
              <TouchableOpacity style={styles.reloadButton}>
                <Text>Reload</Text>
              </TouchableOpacity>
            </View>
          )}
          onSwipeLeft={(index) => handleSwipeLeft(index)}
          onSwipeRight={handleSwipeRight}
        />
      </View>





      {/* BUTTONS: i suppose we can use the ref?
            WHY? we have to trigger the SWIPE LEFT and RIGHT function.. we cant trigger it here
              but we can gtrigger the handleSwipeLeft/Right. 
          
          */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => swipeRef.current?.swipeLeft()}>
          <FontAwesome name="times" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => swipeRef.current?.swipeRight()}>
          <FontAwesome name="heart" size={24} color="black" />
        </TouchableOpacity>
      </View>



    </View>

  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
  },
  reloadButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20, // Adjust spacing between buttons
  },
  button: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 300,
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android elevation
    elevation: 5,
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bio: {
    marginTop: 4,
    color: '#f0f0f0',
    fontSize: 14,
    lineHeight: 18,
  },

  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },




  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  metaText: {
    color: '#ddd',
    fontSize: 14,
  },

  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  dayPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },

  dayText: {
    color: '#fff',
    fontSize: 12,
  },

  location: {
    marginTop: 8,
    color: '#ccc',
    fontSize: 12,
  },


});