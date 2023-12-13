import Papa from 'papaparse';

export default async (files: Array<any>, parts: Array<Part>, project: Project) => {
  return new Promise((resolve, reject) => {
    if (files.length && files[0].type === 'text/csv') {
      const file = files[0]
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = (e.target.result as String)
        console.log(lines)
        const csv = Papa.parse(lines)
        if (csv.errors.length > 0) {
          alert('could not parse CSV file')
          reject()
        }
        const data = csv.data
        console.log(data)
        // parse header line
        let partCol = 0
        let valCol = 0
        let descCol = 0
        let qtyCol = 0
        let fpCol = 0
        let refCol = 0
        data[0].forEach((el: String, i: number) => {
          if (el.toLowerCase() === 'part') {
            partCol = i
          } else if (el.toLowerCase() === 'description') {
            descCol = i
          } else if (el.toLowerCase() === 'value') {
            valCol = i
          } else if (el.toLowerCase() === 'quantity per pcb') {
            qtyCol = i
          } else if (el.toLowerCase() === 'footprint') {
            fpCol = i
          } else if (el.toLowerCase() === 'references') {
            refCol = i
          }
        }) 
  
        let i = 1;
        for (i=1; i < data.length;i++) {
          const line = data[i]
          const row = parseInt(line[0], 10)
          if (!Number.isNaN(row)) {
            const existingPart = parts.find(p => p.part === line[partCol] && p.value === line[valCol] && p.footprint === line[fpCol])
            if (existingPart){
              if (!project.project_parts.find((pp: ProjectPart) => pp.parts.id === existingPart.id)) {
                const pp: ProjectPart = {
                  part_id: existingPart.id,
                  parts: existingPart,
                  project_id: project.id,
                  quantity: line[qtyCol],
                  references: line[refCol],
                } 
                project.project_parts.push(pp)
              }
  
            } else {
              const part: Part = {
                id: null,
                part: line[partCol],
                description: line[descCol],
                value: line[valCol],
                footprint: line[fpCol],
              }
  
              const pp: ProjectPart = {
                parts: part,
                project_id: project.id,
                part_id: null,
                quantity: line[qtyCol],
                references: line[refCol],
              } 
  
              project.project_parts.push(pp)
            }
            
          }
        }

        resolve(project.project_parts)
      };
      reader.readAsText(file);
    } else {
      reject()
    }
  })
  
}
