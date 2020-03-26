import { Class, Enum, MethodParameter, GlobalFunction, Field, Property, Method, EnumMember, IMethodBase, Lambda, Constructor } from "./Types";
import { VariableDeclaration, ForVariable, ForeachVariable, CatchVariable } from "./Statements";
import { Expression, TypeRestriction } from "./Expressions";
import { Type, EnumType, ClassType } from "./AstTypes";

export interface IReferencable {
    createReference(): Reference;
}

export interface IGetMethodBase {
    getMethodBase(): IMethodBase;
}

export class Reference extends Expression { }

// has type: no (not an instance, one of it's property or field will have type)
export class ClassReference extends Reference {
    constructor(public decl: Class) { super(); decl.classReferences.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) { throw new Error("ClassReference cannot have a type!"); }
}

// has type: no (requires call, passing functions is not supported yet)
export class GlobalFunctionReference extends Reference implements IGetMethodBase {
    constructor(public decl: GlobalFunction) { super(); decl.references.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) { throw new Error("GlobalFunctionReference cannot have a type!"); }
    getMethodBase(): IMethodBase { return this.decl; }
}

// has type: yes (it's a variable)
// is generic: should be (if the class is `List<T>` then method param should be `T`, and not `string` - but we cannot check this)
export class MethodParameterReference extends Reference {
    constructor(public decl: MethodParameter) { super(); decl.references.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) { 
        super.setActualType(type, false,
            this.decl.parentMethod instanceof Lambda ? this.decl.parentMethod.parameters.some(x => Type.isGeneric(x.type)) :
            this.decl.parentMethod instanceof Constructor ? this.decl.parentMethod.parentClass.typeArguments.length > 0 :
            this.decl.parentMethod instanceof Method ? this.decl.parentMethod.typeArguments.length > 0 || this.decl.parentMethod.parentInterface.typeArguments.length > 0 : false);
    }
}

// has type: no (only it's values has a value)
export class EnumReference extends Reference {
    constructor(public decl: Enum) { super(); decl.references.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) { throw new Error("EnumReference cannot have a type!"); }
}

// has type: yes
// is generic: no
export class EnumMemberReference extends Expression {
    constructor(public decl: EnumMember) { super(); decl.references.push(this); }
    
    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) {
        if (!(type instanceof EnumType)) throw new Error("Expected EnumType!");
        super.setActualType(type);
    }
}

export class StaticThisReference extends Reference {
    constructor(public cls: Class) { super(); cls.staticThisReferences.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) { throw new Error("StaticThisReference cannot have a type!"); }
}

// has type: yes (needs to be passed as variable which requires type checking)
// is generic: always (`this` is always `List<T>`, but never `List<string>`)
export class ThisReference extends Reference {
    constructor(public cls: Class) { super(); cls.thisReferences.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) {
        if (!(type instanceof ClassType)) throw new Error("Expected ClassType!");
        super.setActualType(type, false, this.cls.typeArguments.length > 0);
    }
}

// has type: no (only used as `super()` and `super.<methodName>(...)`)
export class SuperReference extends Reference {
    constructor(public cls: Class) { super(); cls.superReferences.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) {
        if (!(type instanceof ClassType)) throw new Error("Expected ClassType!");
        super.setActualType(type, false, this.cls.typeArguments.length > 0);
    }
}

// has type: yes
// is generic: can be
export class VariableDeclarationReference extends Reference {
    constructor(public decl: VariableDeclaration) { super(); decl.references.push(this); }
}

// has type: yes
// is generic: can be
export class ForVariableReference extends Reference {
    constructor(public decl: ForVariable) { super(); decl.references.push(this); }
}

// has type: ???
// is generic: ???
export class CatchVariableReference extends Reference {
    constructor(public decl: CatchVariable) { super(); decl.references.push(this); }
}

// has type: yes
// is generic: can be
export class ForeachVariableReference extends Reference {
    constructor(public decl: ForeachVariable) { super(); decl.references.push(this); }
}

// has type: yes
// is generic: no
export class StaticFieldReference extends Reference {
    constructor(public decl: Field) { super(); decl.staticReferences.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) {
        if (Type.isGeneric(type)) throw new Error("StaticField's type cannot be Generic");
        super.setActualType(type);
    }
}

// has type: yes
// is generic: no
export class StaticPropertyReference extends Reference {
    constructor(public decl: Property) { super(); decl.staticReferences.push(this); }

    setActualType(type: Type, allowVoid: boolean, allowGeneric: boolean) {
        if (Type.isGeneric(type)) throw new Error("StaticProperty's type cannot be Generic");
        super.setActualType(type);
    }
}

// has type: yes
// is generic: can be
export class InstanceFieldReference extends Reference {
    constructor(public object: Expression, public field: Field) { super(); field.instanceReferences.push(this); }
}

// has type: yes
// is generic: can be
export class InstancePropertyReference extends Reference {
    constructor(public object: Expression, public property: Property) { super(); property.instanceReferences.push(this); }
}