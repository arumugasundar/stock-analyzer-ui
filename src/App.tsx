import './App.css'
import { Toaster } from "@/components/ui/sonner"
import StockAnalyzer from './components/stock-analyzer';

function App() {

  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center bg-stone-500">
        <StockAnalyzer />
      </div>
       <Toaster />
    </>
  )
}

export default App
