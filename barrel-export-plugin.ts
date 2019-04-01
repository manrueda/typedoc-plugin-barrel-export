import * as path from 'path';
import * as ts from 'typescript';
import {Component} from 'typedoc/dist/lib/utils';
import {ConverterNodeComponent} from 'typedoc/dist/lib/converter/components';
import {Reflection, DeclarationReflection} from 'typedoc/dist/lib/models';
import {Context} from 'typedoc/dist/lib/converter';

// eslint-disable-next-line new-cap
@Component({name: 'barrel-export-plugin'})
export class BarrelExportConverter extends ConverterNodeComponent<
  ts.ExportDeclaration
> {
  supports: ts.SyntaxKind[] = [ts.SyntaxKind.ExportDeclaration];

  convert(context: Context, node: ts.ExportDeclaration): Reflection {
    if (!node.exportClause && node.moduleSpecifier) {
      // Is a barrel export
      const importPath = (node.moduleSpecifier as any).text;
      const ext = path.extname(importPath) || '.ts';

      const reflections = Object.values(context.project.reflections);
      const item = reflections.find(
        r =>
          r.originalName ===
          path.resolve(
            path.dirname((node.parent as any).originalFileName),
            `${importPath}${ext}`
          )
      );
      if (item) {
        const scope = context.scope as DeclarationReflection;
        scope.children = scope.children || [];
        scope.children.push(
          ...((item as DeclarationReflection).children || [])
        );
      }
    }

    return context.scope;
  }
}
