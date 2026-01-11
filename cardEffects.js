export function applyCard(card, me, target, game){
  game.effect = null;

  switch(card.id){
    case "atk_weak":
      target.hp -= 8;
      break;

    case "atk_strong":
      target.hp -= 25;
      game.effect = "explosion";
      break;

    case "heal_small":
      me.hp = Math.min(100, me.hp + 15);
      break;

    case "guard_weak":
      me.hp += 5;
      break;

    case "mystery":
      if (Math.random() < 0.5) target.hp -= 20;
      else me.hp += 20;
      game.effect = "mystery";
      break;
  }

  if (target.hp <= 0) target.alive = false;
}
