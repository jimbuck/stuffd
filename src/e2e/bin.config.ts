import { writeFile } from 'fs';
import { Stuffd, Context } from '..';
import { Int, Str, Custom, List, Enum } from '../decorators';
import { Key, Float, Ref, Guid } from '../lib/services/decorators';

//#region Nested

enum Region {
  North,
  East,
  South,
  West
}

@Stuffd()
export class Player {
  
  @Custom(c => `${c.first()} ${c.last()}`)
  name: string;

  @Int(1, 99)
  number: number;

  @Str(/[IORW][RB]/)
  position: string;
}

@Stuffd()
export class Team {
  
  @List(Player, 3)
  players: Array<Player>;

  @Custom(c => `${c.first()} ${c.last()}`)
  owner: string;

  @Custom(c => c.animal())
  mascot: string;

  @Custom(c => c.city())
  city: string;

  @Enum(Region)
  region: string;
}

@Stuffd()
export class League {
  
  @List(Team, 4, 8)
  teams: Array<Team>;

  @Custom(c => `${c.first()} ${c.letter({ casing: 'upper' })}. ${c.last()}`)
  chairmen: string;
}

Stuffd.task('nested', async (ctx, args) => {
  ctx.create(League, 2);
  await writeToFile(ctx.json(), args.file);
});

//#endregion

//#region Relational

@Stuffd()
export class Department {
  @Key() id: string;
  @Str(8, 20) name: string;
}

@Stuffd()
export class Shopper {
  @Key() @Guid() id: string;
  @Custom(c => c.first({ nationality: 'en' }) + ' ' + c.last({ nationality: 'en' })) name: string;
  @Str(/[\d]{4}-[\d]{4}-[\d]{4}-[\d]{4}/) creditCard: string;
}

@Stuffd()
export class Product {
  @Key() id: string;
  @Str(8, 16) name: string;
  @Float(2, 8, 100) price: number;
  @Ref(Department) departmentId: string;
}

@Stuffd()
export class CartItem {
  @Ref(Shopper) shopperId: string;
  @Ref(Product) productId: string;
}

// Stuffd.task('relational', async (ctx, args) => {  
//   const shoppers = ctx.create(Shopper, 6);
//   const departments = ctx.create(Department, 3);
//   const products = ctx.using({ 'departmentId': departments }).create(Product, 20);
//   const cartItems = ctx.using({ 'shopperId': shoppers, 'productId': products }).create(CartItem, 25);

//   await writeToFile(ctx.json(), args.file);
// });

//#endregion

//#region Default

Stuffd.task('default', async (ctx, args) => {
  await writeToFile('true', args.file);
});

//#endregion


//#region Helpers

function writeToFile(content: string, filename: string) {
  return new Promise<string>((resolve, reject) => {
    writeFile(filename, content, { flag: 'w' }, (err => err ? reject(err) : resolve(filename)));
  });
}

//#endregion