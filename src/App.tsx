import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Pokemon } from "@/components/pokemon-new";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-slate-100">
        <header className="App-header">
          <h1>React Query Demo</h1>
        </header>

        <main className="bg-slate-100">
          <Pokemon />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
