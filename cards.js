export const CARD_POOL = [
  { id:"atk_weak", type:"attack", power:8, weight:20 },
  { id:"atk_strong", type:"attack", power:25, weight:10 },
  { id:"heal_small", type:"heal", power:15, weight:10 },
  { id:"guard_weak", type:"guard", power:10, weight:10 },
  { id:"mystery", type:"special", effect:"random", weight:5 },
];

export function drawCard(){
  const total = CARD_POOL.reduce((s,c)=>s+c.weight,0);
  let r = Math.random()*total;
  for(const c of CARD_POOL){
    if((r-=c.weight)<=0) return structuredClone(c);
  }
}
