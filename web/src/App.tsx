import './styles/global.css';
import { Habit } from "./components/Habit";

export function App() {
  return (
    <>
      <Habit completed={2} />
      <Habit completed={3} />
      <Habit completed={1} />
    </>
  )
}
