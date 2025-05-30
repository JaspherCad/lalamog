//https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?utm_source=youtube&utm_medium=social&utm_term=expo-react-native&utm_content=AE7dKIKMJy4&queryGroups=auth-store&auth-store=async-storage&queryGroups=database-method&database-method=dashboard#get-the-api-keys



import { Button, Input } from '@rneui/themed'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, AppState, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'


AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const router = useRouter()
  const [email, setEmail] = useState('tanga2@gmail.com')
  const [password, setPassword] = useState('password123!')
  const [loading, setLoading] = useState(false)


  const geojson = `SRID=4326;POINT(120.9842 14.5995)`;


  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert(error.message);
      console.log(error)
    } else {
      const { data } = await supabase.auth.getSession();
      router.replace('/Account');
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          location: geojson
        }
      }
    });


    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)

    // router.replace('/(tabs)')  --no need maybe let's test muna

  }





  async function seedUsers() {
    setLoading(true)
    const users = [
      { email: "kingBarou@gmail.com", password: "password123" },
 
      // //jairene@gmail "password123"
      // //joshua "password123"
      // //jeneth  OUTSIDER "password123"
      // //jane "password123"
      // //nikki "password123"
      // //kingbarou "password123"

     
    ]

    for (let u of users) {
      const { data: { session }, error } = await supabase.auth.signUp({
        email: u.email,
        password: u.password
      });

      if (error) {
        Alert.alert('Error seeding', error.message)
        break
      }
      console.log(`adding ${u.email} works!`)
    }

    Alert.alert('✅ Seed complete!')
    setLoading(false)
  }


  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>


      <View style={styles.verticallySpaced}>
        <Button
          title="Generate Dummy Users"
          loading={loading}
          containerStyle={styles.mt20}
          onPress={() =>
            Alert.alert(
              'Generate Dummy Users?',
              'This will create test accounts in your dev DB.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go for it', onPress: seedUsers },
              ]
            )
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})