import { Modding } from "@flamework/core";
import { Fact, Assert } from "@rbxts/runit";
import { t } from "@rbxts/t";

import { safeCast } from "shared/utility/meta";

interface Foo {
  readonly foo: number;
}

class SafeCastTest {
  @Fact()
  public generatesTypeGuard(): void {
    this.checkFoo();
  }

  @Fact()
  public usesExistingTypeGuard(): void {
    const fooGuard = t.interface({
      foo: t.number
    });

    this.checkFoo(fooGuard);
  }

  /** @metadata macro */
  private checkFoo<T extends Foo>(guard?: t.check<T> | Modding.Generic<T, "guard">): void {
    const invalidFoo = safeCast<T>({}, guard);
    const validFoo = safeCast<T>({ foo: 123 }, guard);

    Assert.undefined(invalidFoo);
    Assert.notUndefined(validFoo);
    if (Assert.isType<T>(validFoo)) {
      Assert.equal(123, validFoo.foo);
    }
  }
}

export = SafeCastTest;