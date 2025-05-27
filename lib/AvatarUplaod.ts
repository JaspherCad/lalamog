import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'

import { useState } from 'react'
import { Alert } from 'react-native'
import { supabase } from '../lib/supabase'



//SIMPLE GOAL
//to upload
//get userID (used for filepath), setAvatarUrl(customFunction from account.tsx)
//get image result from ImagePicker
//process the 'image' 
//use base64 to decode.. idk why just follow the tutorial
//set proper file extension
//const filePath = `${userId}/${Date.now()}.${fileExtension}`


//Upload to supabase + decode(base64)

//to retrieve...
// const { data } = supabase
//     .storage
//     .from('public-bucket')
//     .getPublicUrl('folder/avatar1.png')
//use the setAvatar from component ---- setAvatar(data) easy
//base case (update daw)


//27/05/2025
            //SIMPLE GOAL ❌ ==> base64 keeps error.. try blob
            //base64 is the supported way to upload media type REACT NATIVE + supabase... keep base64 not blob

export function useAvatarUpload() {
    const [uploading, setUploading] = useState(false)

    async function uploadAvatar(userId: string, setAvatarUrl: (url: string) => void) {
        setUploading(true)

        if (!userId) {
            console.error('Missing user ID')
            Alert.alert('Error', 'User ID is required')
            setUploading(false)
            return
        }

        try {
            //permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Need access to media library')
                setUploading(false)
                return
            }

            
            
            


            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.75,
                // base64: true,
            })

            if (result.canceled) {
                setUploading(false)
                return
            }

            const asset = result.assets[0]
            const uri = asset.uri

            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            })

            const fileExtension = uri.split('.').pop()?.toLowerCase() || 'png'
            const normalizedExt = fileExtension === 'jpg' ? 'jpeg' : fileExtension

            const filePath = `${userId}/${Date.now()}.${normalizedExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64), {
                    contentType: `image/${normalizedExt}`,
                    upsert: true,
                })

            if (uploadError) throw uploadError

            //       const { data } = supabase
            //   .storage
            //   .from('public-bucket')
            //   .getPublicUrl('folder/avatar1.png')

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            if (publicUrl) {
                console.log(publicUrl)
                setAvatarUrl(publicUrl)

                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', userId)

                if (updateError) {
                    setAvatarUrl('')
                    throw updateError
                }

                Alert.alert('Success', 'Avatar updated successfully')
            }
        } catch (error) {
            console.error('Avatar upload error:', error)
            Alert.alert('Error', 'Failed to upload avatar. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return { uploadAvatar, uploading }
}