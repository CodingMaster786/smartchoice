import './globals.css'
import Header from '@/components/Header'
import OneSignalPrompt from '@/components/OneSignalPrompt'
export const metadata={title:'SmartChoice – Choose Smart. Shop Better.',description:'Find the right product at the right price.'}
export default function L({children}){return(<html lang="en"><body>
<Header/><main className="max-w-7xl mx-auto px-3 py-4 min-h-[70vh]">{children}</main><OneSignalPrompt/>
<footer className="bg-blue-900 text-blue-100 text-xs text-center p-6 mt-8">© 2026 SmartChoice. All Rights Reserved.<p></p>Smart shopping starts here. Discover quality products, compare prices, and find the right deals at the right price.<br/>Created by Huzaif khan</footer>
</body></html>)}
