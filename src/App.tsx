import { QueryClient, QueryClientContext, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Pokemon } from "./components/pokemon";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="App-header">
          <h1>React Query Demo</h1>
        </header>

        <main>
          <Pokemon />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
