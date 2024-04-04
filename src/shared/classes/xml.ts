import Object from "@rbxts/object-utils";
import StringBuilder from "./string-builder";
import Log from "shared/logger";

export interface XMLElement<Root extends boolean = false> {
  [key: string]: If<Root, Maybe<XMLElement>, XMLElementValue> | undefined;
  attributes?: If<Root, undefined, XMLAttributes>;
}

const NULL = <const>"__NULL__";
type NULL = typeof NULL;

export type XMLAttributes = Record<string, XMLElementValue>;

export type XMLAttributeValue =
  | number
  | string
  | boolean
  | NULL;

export type XMLElementValue =
  | number
  | string
  | boolean
  | XMLElement
  | NULL;

/*
{
  Test: {
    attributes: {
      XML: true
    },
    A: 1,
    B: true,
    C: "alphabet",
    D: "__NULL__"
  }
}
(JSON)
{
  "Test": {
    "attributes": {
      "XML": true
    },
    "A": 1,
    "B": true,
    "C": "alphabet",
    "D": "__NULL__"
  }
}

to

<Test XML="true">
  <A>1</A>
  <B>true</B>
  <C>alphabet</C>
  <D xsi:nil="true"/>
</Test>
*/

const sortAlphabetical = <T extends string | number>(a: T, b: T): boolean => <string>a < <string>b;
function isLastElement<T extends defined = defined>(arr: T[], element: T): boolean {
  return element === arr[arr.size() - 1];
}

class XMLEncodeException extends Log.Exception {
  public constructor(message: string) {
    super("XMLEncode", message);
	}
}

class XMLDecodeException extends Log.Exception {
  public constructor(message: string) {
    super("XMLDecode", message);
	}
}

class Encode {
  public static tag(name: string, value: XMLElementValue, attributes: XMLAttributes = {}, indentation?: number): string {
    const tag = new StringBuilder;
    if (indentation !== undefined)
      tag.indentation = indentation;

    const nullElement = value === NULL;
    if (nullElement)
      attributes["xsi:nil"] = true;

    tag.append(`<${name}${Object.values(attributes).size() > 0 ? " " + this.attributes(attributes) : ""}${nullElement ? "/" : ""}>`);
    const children = typeOf(value) === "table" ? Object.keys(<XMLElement>value).sort(sortAlphabetical) : [];
    if (children.size() > 0) {
      tag.pushIndentation();
      tag.newLine();

      children.remove(children.indexOf("attributes"));
      for (const childName of children) {
        const childValue = (<XMLElement>value)[childName]!;
        let childAttributes: Maybe<XMLAttributes>;
        if (typeOf(childValue) === "table")
          childAttributes = (<XMLElement>childValue).attributes;

        const childXML = this.tag(tostring(childName), childValue, childAttributes, tag.indentation);
        tag.append(childXML);
        if (isLastElement(children, childName))
          tag.popIndentation();

        tag.newLine();
      }
    } else
      tag.append(value === NULL ? "" : tostring(value));

    tag.append(!nullElement ? `<${name}/>` : "");
    return tag.string();
  }

  private static attributes(attributes: Record<string, XMLElementValue>): string {
    return Object.entries(attributes)
      .sort(([keyA], [keyB]) => keyA < keyB)
      .map(([name, value]) => `${name}="${value === NULL ? "" : tostring(value)}"`)
      .join(" ");
  }
}

export class XML {
  public static encode(obj: XMLElement<true>): string {
    const xml = new StringBuilder;
    const keys = Object.keys(obj).sort(sortAlphabetical);
    if (keys.size() < 1)
      throw new XMLEncodeException("XML document must have at least one element");

    for (const key of keys) {
      const value = obj[key];
      xml.append(Encode.tag(<string>key, <XMLElementValue>value, value?.attributes, xml.indentation));
      if (!isLastElement(keys, key))
        xml.newLine();
    }

    return xml.string();
  }

  public static decode(xml: string): XMLElement<true> {
    const obj: XMLElement<true> = {};
    return obj;
  }
}