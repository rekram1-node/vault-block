export interface SearchPagesResponse {
  object: string;
  results: Result[];
  //   next_cursor: any;
  has_more: boolean;
  type: string;
  //   page_or_database: PageOrDatabase;
  request_id: string;
}

export interface Result {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: CreatedBy;
  last_edited_by: LastEditedBy;
  //   cover: any;
  //   icon: any;
  parent: Parent;
  archived: boolean;
  in_trash: boolean;
  properties: Properties;
  url: string;
  //   public_url: any;
  title?: Title4[];
  //   description?: any[];
  is_inline?: boolean;
}

export interface CreatedBy {
  object: string;
  id: string;
}

export interface LastEditedBy {
  object: string;
  id: string;
}

export interface Parent {
  type: string;
  workspace?: boolean;
  page_id?: string;
}

export interface Properties {
  title?: Title;
  Name?: Name;
}

export interface Title {
  id: string;
  type: string;
  title: Title2[];
}

export interface Title2 {
  type: string;
  text: Text;
  annotations: Annotations;
  plain_text: string;
  //   href: any;
}

export interface Text {
  content: string;
}

export interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface Name {
  id: string;
  name: string;
  type: string;
  //   title: Title3;
}

// export interface Title3 {}

export interface Title4 {
  type: string;
  text: Text2;
  annotations: Annotations2;
  plain_text: string;
}

export interface Text2 {
  content: string;
}

export interface Annotations2 {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}
