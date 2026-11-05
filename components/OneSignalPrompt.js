'use client'

import {useEffect,useState} from 'react'

const APP_ID='8923ac28-6344-4f58-a9ef-3959445b987c'
const SDK_URL='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'

export default function OneSignalPrompt(){
const[ready,setReady]=useState(false),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false)
useEffect(()=>{
if(typeof window==='undefined')return
window.OneSignalDeferred=window.OneSignalDeferred||[]
window.OneSignalDeferred.push(async OneSignal=>{
try{
await OneSignal.init({appId:APP_ID})
setReady(true)
setVisible(!OneSignal.User.PushSubscription.optedIn)
}catch(error){console.error('OneSignal initialization failed:',error)}
})
if(!document.querySelector(`script[src="${SDK_URL}"]`)){
const script=document.createElement('script')
script.src=SDK_URL
script.defer=true
script.dataset.onesignal='smartchoice'
document.head.appendChild(script)
}
},[])
if(!ready||!visible)return null
const subscribe=async()=>{
setBusy(true)
try{
await window.OneSignalDeferred.push(async OneSignal=>{
await OneSignal.Notifications.requestPermission()
setVisible(!OneSignal.User.PushSubscription.optedIn)
})
}catch(error){console.error('OneSignal subscription failed:',error)}
finally{setBusy(false)}
}
return <aside className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-blue-950 p-4 text-white shadow-2xl" role="dialog" aria-label="SmartChoice notifications">
<div className="min-w-0 flex-1"><p className="font-semibold">Stay updated with SmartChoice</p><p className="mt-1 text-xs text-blue-100">Get alerts for fresh deals and useful product updates.</p></div>
<button type="button" onClick={subscribe} disabled={busy} className="shrink-0 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-bold text-blue-950 hover:bg-yellow-300 disabled:opacity-60">{busy?'Enabling…':'Enable alerts'}</button>
<button type="button" onClick={()=>setVisible(false)} aria-label="Dismiss notifications prompt" className="self-start text-xl leading-none text-blue-200 hover:text-white">×</button>
</aside>
}
