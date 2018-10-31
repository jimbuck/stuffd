const { Stuffd } = require('../dist');

const Region = Stuffd.createEnum({
  North: 0,
  East: 1,
  South: 2,
  West: 3,
});

const Player = Stuffd.create('Player')
  .prop('name', n => n.custom(c => `${c.first()} ${c.last()}`))
  .prop('number', n => n.integer(1, 99))
  .prop('position', n => n.str(/[IORW][RB]/))
  .build();

const Team = Stuffd.create('Team')
  .prop('players', p => p.list(Player, 3))
  .prop('owner', o => o.custom(c => `${c.first()} ${c.last()}`))
  .prop('mascot', m => m.custom(c => c.animal()))
  .prop('city', m => m.custom(c => c.city()))
  .prop('region', m => m.enum(Region, String))
  .build();

const League = Stuffd.create('League')
  .prop('teams', p => p.list(Team, 4, 8))
  .prop('chairman', o => o.custom(c => `${c.first()} ${c.letter({ casing: 'upper' })}. ${c.last()}`))
  .build();

Stuffd.task('default', (ctx) => {
  ctx.create(League, 1);

  const json = ctx.json();

  console.log(`this is the json:`);
  console.log(json);
});