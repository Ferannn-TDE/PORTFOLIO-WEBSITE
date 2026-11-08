// Visible placeholder for a fact still to be confirmed. Search the code for
// "<Todo" (or the rendered "[TODO:") to find every one.
export default function Todo({ children = "confirm" }) {
  return <span className="todo">[TODO: {children}]</span>;
}
