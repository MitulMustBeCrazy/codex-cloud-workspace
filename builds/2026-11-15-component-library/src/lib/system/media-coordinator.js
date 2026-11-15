/** One playing media item per presentation, without global document listeners. */
export function createMediaCoordinator() {
  const players = new Map();
  let current = null;
  return {
    register(id, pause) {
      if(!id || typeof pause !== "function")throw new Error("Invalid media registration");
      const token=Symbol(id);
      players.set(id,{pause,token});
      return () => { if(players.get(id)?.token===token){players.delete(id);if(current===id)current=null;} };
    },
    activate(id) {
      if(!players.has(id))return false;
      for(const [other,handler] of players)if(other!==id)handler.pause();
      current=id;return true;
    },
    deactivate(id) {if(current===id)current=null;},
    activeId() {return current;},
    reset() {for(const handler of players.values())handler.pause();players.clear();current=null;}
  };
}
export const mediaCoordinator = createMediaCoordinator();
