import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './Sidebar/sidebar';
import { AddTransaction } from './add_transaction/Add_transaction'; // Capital 'A' to match your file

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, AddTransaction],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}