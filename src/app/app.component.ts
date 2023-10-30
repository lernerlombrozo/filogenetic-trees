import { Component } from '@angular/core';

type Row = (number | null)[]

type Table = {
  colNames: number[][],
  table: Row[]
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private maxSize = 27;
  size = 0;
  tableCreated = false;
  treeCreated = false;

  errorMessage = '';

  startingTable: Table = {
    colNames: [],
    table: []
  };

  tree: Table[] = [];
  distances: number[] = []


  public createDefaultTable():void {
    this.startingTable = {
      colNames: [[0], [1], [2], [3], [4], [5], [6]],
      table: [[null,null,null,null,null,null,null],[19,null,null,null,null,null,null],[27, 31,null,null,null,null,null], [8,18,26,null,null,null,null], [33,36,41,31,null,null,null], [18,1,32,17,35,null,null], [13,13,29,14,28,12, null]]
    };
    this.tableCreated = true;
  }

  public createTable(): void{
    if(this.size <= 2){
      this.createError('Table size too small. Min is 2');
      return;
    }
    if(this.size > this.maxSize){
      this.createError('Table size too big. Max is ' + this.maxSize);
      return;
    }
    this.errorMessage = '';
    this.startingTable.table = [];
    this.startingTable.colNames = [];
    const table = this.startingTable.table;
    for(let i=0;i<this.size;i++){
      const row: number[] = [];
      for(let j=0;j<this.size;j++){
        row.push(0);
      }
      table.push(row);
      this.startingTable.colNames.push([i]);
    }
    this.tableCreated = true;
  }

  public updateCell(event: any, colIndex: number, rowIndex: number): void{
    const inputNumber = +event.innerHTML
    if(typeof inputNumber === 'number'){
      this.startingTable.table[colIndex][rowIndex] = inputNumber;
      // this.startingTable.table[rowIndex][colIndex] = inputNumber;
    }
    this.treeCreated = false;
  }

  public createTree(){
    this.tree = [];
    this.tree.push(this.startingTable);
    for(let i=0; i<this.startingTable.colNames.length - 2; i++){
      const nextTable = this.calculateNextTable(this.tree[this.tree.length -1]);
      this.tree.push(nextTable);
      console.log(nextTable);
    }
    this.treeCreated = true;
  }

  calculateNextTable(previousTable: Table): Table {
    // Step 1 estimate the minimum distances
    let minDistance: {a:number, b:number, value:number} = this.getMinDistance(previousTable);

    let newTable: Table = {
      colNames:[],
      table: []
    }
    const joinCols: number[]  = [... previousTable.colNames[minDistance.a], ... previousTable.colNames[minDistance.b]];
    let foundFirstCol = false;
    // Step 2 create the new columns
    for(let rowIndex = 0; rowIndex<previousTable.table.length; rowIndex++){
      if(minDistance.a !== rowIndex && minDistance.b !== rowIndex){
        newTable.colNames.push(previousTable.colNames[rowIndex]);
      } else if(!foundFirstCol){
        newTable.colNames.push(joinCols);
        foundFirstCol = true;
      }
    }

    // Step 3 create the table
    for(let rowIndex = 0; rowIndex<newTable.colNames.length; rowIndex++){
      const row: Row = [];
      for(let colIndex = 0; colIndex<newTable.colNames.length; colIndex++){
        if(rowIndex<=colIndex){
          row.push(null);
          continue;
        }
        row.push(this.getDistance(newTable.colNames[rowIndex], newTable.colNames[colIndex]));
      }
      newTable.table.push(row);
    }

    return newTable;
  }

  private getMinDistance(table: Table) : {a:number, b:number, value:number} {
    const minDistance: {a:number, b:number, value:number} = {a: table.table.length, b:table.table.length, value:Infinity};
    for(let rowIndex=1; rowIndex<table.table.length; rowIndex++){
      for(let colIndex=0; colIndex<rowIndex; colIndex++){
        const currentCelValue = table.table[rowIndex][colIndex];
        if(currentCelValue != null && currentCelValue < minDistance.value){
          minDistance.value = currentCelValue;
          minDistance.a = colIndex;
          minDistance.b = rowIndex;
        }
      }
    }
    return minDistance;
  }

  private getDistance(rowNames: number[], colNames:number[]): number{
    console.log(`getting distance for ${this.getLetters(colNames)}: ${this.getLetters(rowNames)}`)
    let n = 0;
    let total = 0;
    let debugTotal = "";
    for(let row = 0; row<rowNames.length; row++){
      for (let col = 0; col<colNames.length; col++){
        total += this.startingTable.table[rowNames[row]][colNames[col]] || this.startingTable.table[colNames[col]][rowNames[row]] || 0;
        debugTotal += this.startingTable.table[rowNames[row]][colNames[col]] + " + ";
        n +=1;
      }
    }
    console.log(`total: ${total}, n: ${debugTotal}`)
    return total/n;
  }

  private getLetters(names: number[]): string{
    let letters = "";
    for(let name of names){
      letters += this.getNthChar(name);
    }
    return letters;
  }

  public getNthChar(n: number): string {
    return String.fromCharCode(n+65);
  }

  private createError(error: string){
    this.errorMessage = error;
  }
}
