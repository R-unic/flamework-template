interface CreateMeshPartAsyncOptions {
  CollisionFidelity: Enum.CollisionFidelity;
  RenderFidelity: Enum.RenderFidelity;
  FluidFidelity: Enum.FluidFidelity;
}

interface EditableMesh extends DataModelMesh {
  /**
   * Tags: CustomLuaState
   */
  GetFaces(this: EditableMesh): number[];
  GetFacesWithAttribute(this: EditableMesh, id: number): number[];
  /**
   * Tags: CustomLuaState
   */
  GetNormals(this: EditableMesh): number[];
  /**
   * Tags: CustomLuaState
   */
  GetUVs(this: EditableMesh): number[];
  /**
   * Tags: CustomLuaState
   */
  GetFaceVertices(this: EditableMesh, faceId: number): number[];
  GetCenter(this: EditableMesh): Vector3;
  GetSize(this: EditableMesh): Vector3;
}

interface AssetService extends Instance {
  CreateEditableMesh(this: AssetService, editableMeshOptions?: Record<string, unknown>): EditableMesh;
  /**
   * Tags: Yields
   */
  CreateEditableMeshAsync(this: AssetService, content: Content, editableMeshOptions?: Record<string, unknown>): EditableMesh;
  CreateMeshPartAsync(this: AssetService, meshContent: Content, options?: Partial<CreateMeshPartAsyncOptions>): MeshPart;
}

interface Content {
  /**
 * **DO NOT USE!**
 *
 * This field exists to force TypeScript to recognize this as a nominal type
 * @hidden
 * @deprecated
 */
  readonly _nominal_Content: unique symbol;
  readonly SourceType: Enum.ContentSourceType;
  readonly Uri?: string;
  readonly Object?: Instance;
}

interface ContentConstructor {
  readonly none: Content;
  fromUri: (uri: string) => Content;
  fromObject: (object: Instance) => Content; // garbage typedef
  fromAssetId: (assetId: number) => Content;
}

declare const Content: ContentConstructor;