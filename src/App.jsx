import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MenuSection from './components/MenuSection'
import Reviews from './components/Reviews'
import DrawerManager from './components/DrawerManager'
import FloatingCart from './components/FloatingCart'
import Footer from './components/Footer'
import Toast from './components/Toast'
import NotificationPrompt from './components/NotificationPrompt'
import InstallPrompt from './components/InstallPrompt'
import { useNotifications } from './hooks/useNotifications'
import './index.css'

function AppInner() {
  const { user } = useApp()
  useNotifications(user)
  return (
    <>
      <Navbar />
      <Hero />
      <MenuSection />
      <Reviews />
      <Footer />
      <DrawerManager />
      <FloatingCart />
      <Toast />
      <NotificationPrompt />
      <InstallPrompt />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
