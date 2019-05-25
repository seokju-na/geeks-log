interface StackPrototype {
  id: string;
  name: string;
  displayName: string;
}

export interface LanguageStack extends StackPrototype {
  type: 'language';
  color?: string;
}

export interface FrameworkStack extends StackPrototype {
  type: 'framework';
}

export interface ToolStack extends StackPrototype {
  type: 'custom';
}

type Stack = LanguageStack;
export default Stack;
