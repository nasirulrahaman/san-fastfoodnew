import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MenuSection from './components/MenuSection'
import DrawerManager from './components/DrawerManager'
import FloatingCart from './components/FloatingCart'
import Footer from './components/Footer'
import Toast from './components/Toast'
import './index.css'

export default function App() {
  return (
    <AppProvider>
      <Navbar />
      <Hero />
      <MenuSection />
      <Footer />
      <DrawerManager />
      <FloatingCart />
      <Toast />
    </AppProvider>
  )
}
