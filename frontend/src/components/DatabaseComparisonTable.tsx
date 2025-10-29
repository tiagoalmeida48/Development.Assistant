import { Database, CheckCircle2, MinusCircle } from 'lucide-react'
import type { DatabaseClass } from '@/api'

interface GroupedColumn {
  name: string
  bank1Type: string | null
  bank2Type: string | null
}

interface GroupedTable {
  bank1: any
  bank2: any
  columns: Record<string, GroupedColumn>
}

interface DatabaseComparisonTableProps {
  tables: DatabaseClass['tables']
  database1: string
  database2: string
}

export function DatabaseComparisonTable({ tables, database1, database2 }: DatabaseComparisonTableProps) {
  // Agrupar dados por tabela e coluna
  const groupedData: Record<string, GroupedTable> = {}

  tables.forEach(item => {
    const tableName = item.table

    if (!groupedData[tableName]) {
      groupedData[tableName] = {
        bank1: null,
        bank2: null,
        columns: {}
      }
    }

    // Identificar em qual banco a tabela existe
    if (item.database === database1) {
      groupedData[tableName].bank1 = item
    } else if (item.database === database2) {
      groupedData[tableName].bank2 = item
    }

    // Processar colunas
    if (item.columns) {
      item.columns.forEach(col => {
        const colKey = col.name
        if (!groupedData[tableName].columns[colKey]) {
          groupedData[tableName].columns[colKey] = {
            name: col.name,
            bank1Type: null,
            bank2Type: null
          }
        }

        if (item.database === database1) {
          groupedData[tableName].columns[colKey].bank1Type = col.type
        } else if (item.database === database2) {
          groupedData[tableName].columns[colKey].bank2Type = col.type
        }
      })
    }
  })

  // Renderizar linhas agrupadas
  const rows: React.JSX.Element[] = []
  Object.keys(groupedData).forEach((tableName, tableIdx) => {
    const tableData = groupedData[tableName]
    const columns = Object.values(tableData.columns) as GroupedColumn[]
    const hasColumns = columns.length > 0

    if (hasColumns) {
      columns.forEach((col, colIdx) => {
        const existsInBank1 = col.bank1Type == null
        const existsInBank2 = col.bank2Type == null
        const type = col.bank1Type || col.bank2Type

        rows.push(
          <tr key={`${tableIdx}-${colIdx}`} className="border-b hover:bg-muted/50">
            {colIdx === 0 && (
              <td
                className="px-2 py-1.5 font-semibold align-top border-r"
                rowSpan={columns.length}
              >
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {tableName}
                </div>
              </td>
            )}
            <td className="px-2 py-1.5">{col.name}</td>
            <td className="px-2 py-1.5 font-mono text-[10px]">{type}</td>
            <td className={`px-2 py-1.5 text-center ${existsInBank1 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              {existsInBank1 ? (
                <span className="inline-flex items-center gap-0.5 text-green-700 dark:text-green-400 text-[10px]">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Sim
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-red-700 dark:text-red-400 text-[10px]">
                  <MinusCircle className="h-2.5 w-2.5" />
                  Não
                </span>
              )}
            </td>
            <td className={`px-2 py-1.5 text-center ${existsInBank2 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-red-50 dark:bg-red-950'}`}>
              {existsInBank2 ? (
                <span className="inline-flex items-center gap-0.5 text-blue-700 dark:text-blue-400 text-[10px]">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Sim
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-red-700 dark:text-red-400 text-[10px]">
                  <MinusCircle className="h-2.5 w-2.5" />
                  Não
                </span>
              )}
            </td>
          </tr>
        )
      })
    } else {
      // Tabela sem colunas (tabela inteira faltando)
      const existsInBank1 = tableData.bank1 == null
      const existsInBank2 = tableData.bank2 == null

      rows.push(
        <tr key={`${tableIdx}-0`} className="border-b hover:bg-muted/50">
          <td className="px-2 py-1.5 font-semibold border-r">
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {tableName}
            </div>
          </td>
          <td className="px-2 py-1.5 text-muted-foreground italic" colSpan={2}>
            Tabela completa
          </td>
          <td className={`px-2 py-1.5 text-center ${existsInBank1 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
            {existsInBank1 ? (
              <span className="inline-flex items-center gap-0.5 text-green-700 dark:text-green-400 text-[10px]">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Sim
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-red-700 dark:text-red-400 text-[10px]">
                <MinusCircle className="h-2.5 w-2.5" />
                Não
              </span>
            )}
          </td>
          <td className={`px-2 py-1.5 text-center ${existsInBank2 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-red-50 dark:bg-red-950'}`}>
            {existsInBank2 ? (
              <span className="inline-flex items-center gap-0.5 text-blue-700 dark:text-blue-400 text-[10px]">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Sim
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-red-700 dark:text-red-400 text-[10px]">
                <MinusCircle className="h-2.5 w-2.5" />
                Não
              </span>
            )}
          </td>
        </tr>
      )
    }
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted border-b">
          <tr>
            <th className="px-2 py-1.5 text-left font-semibold">Tabela</th>
            <th className="px-2 py-1.5 text-left font-semibold">Campo</th>
            <th className="px-2 py-1.5 text-left font-semibold">Tipo</th>
            <th className="px-2 py-1.5 text-center font-semibold bg-green-50 dark:bg-green-950">
              <div className="flex items-center justify-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {database1}
              </div>
            </th>
            <th className="px-2 py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center justify-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {database2}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}
