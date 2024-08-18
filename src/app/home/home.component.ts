import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';

import axios from 'axios';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  updatePlayer(item: Item) {}
  @ViewChild('myModal') model: ElementRef | undefined;
  @ViewChild('modelError') modelError: ElementRef | undefined;
  private apiUrl = 'http://localhost:3000/api/items';
  updateItem: boolean = false;
  ItemObj: Item = new Item();
  list: Item[] = [];
  listItems: Item[] = [];
  Message: string = '';

  showBuffer: boolean = false;
  isUserLoggedIn: string | null | undefined;

  async ngOnInit() {
    this.isUserLoggedIn = localStorage.getItem('isLoggedIn');

    this.list = await this.getItems();
  }
  async getItems() {
    try {
      const response = await axios.get(this.apiUrl);
      this.listItems = response.data;
      return this.listItems;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }
  async saveItem(file: File | null) {
    if (file) {
      const formData = new FormData();

      formData.append('image', file);

      // Upload image to server
      await axios
        .post('http://localhost:3000/api/upload', formData)
        .then(async (response) => {
          const imagePath = response.data.imagePath;
          const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
          this.ItemObj.image = fileName;
          if(this.updateItem){
            await axios
            .put('http://localhost:3000/api/items/update', this.ItemObj)
            .then(async (response) => {
                console.log('Item updated:', response.data);
                this.list = await this.getItems();
            })
            this.updateItem = false;
          }else{
          await axios
            .post('http://localhost:3000/api/items', this.ItemObj)
            .then(async (response) => {
              console.log('Item saved:', response.data);
              if (this.ItemObj.date) {
                const today = new Date();
                const inputDate = new Date(this.ItemObj.date);
                if (
                  inputDate.getFullYear() === today.getFullYear() &&
                  inputDate.getMonth() === today.getMonth() &&
                  inputDate.getDate() === today.getDate()
                ) {
                  this.list = await this.getItems();
                } else {
                  const timeUntilDate = inputDate.getTime() - today.getTime();
                  const item = this.ItemObj;
                  setTimeout(() => {
                    this.list.push(item);
                  }, timeUntilDate);
                }
              }
            })
            .catch((error) => {
              console.error('Error saving item:', error);
            });
          }
        })

        .catch((error) => {
          console.error('Error uploading image:', error);
        });
    }
    this.list = await this.getItems();
    this.closeModel();
  }
  openModal() {
    if (this.model != null) {
      this.model.nativeElement.style.display = 'block';
    }
  }
  updateModal(item: Item) {
    this.updateItem = true;
    this.ItemObj = { ...item };
    if (this.model != null) {
      this.model.nativeElement.style.display = 'block';
    }
  }
  closeModel() {
    (this.ItemObj.name = ''),
      (this.ItemObj.price = 0),
      (this.ItemObj.description = ''),
      (this.ItemObj.image = '');
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }
  errorMessage() {
    this.Message = 'Validation is required!';
    this.openError();
  }
  openError() {
    if (this.modelError != null) {
      this.modelError.nativeElement.style.display = 'block';
    }
  }
  closeError() {
    if (this.modelError != null) {
      this.modelError.nativeElement.style.display = 'none';
    }
  }

  draggedItemIndex: number | null = null;

  onDragStart(event: DragEvent, index: number) {
    this.draggedItemIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    const draggedIndex = this.draggedItemIndex;
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const draggedItem = this.list[draggedIndex];
      this.list.splice(draggedIndex, 1);
      this.list.splice(dropIndex, 0, draggedItem);
    }
    this.draggedItemIndex = null;
  }
  async removeItem(index: number) {
    try {
      console.log(`${this.apiUrl}/delete/${index}`);
      const response = await axios.delete(`${this.apiUrl}/delete/${index}`);
      if (response.status === 200 || response.status === 204) {
        // this.list.splice(index, 1);
        this.Message = 'Item successfully removed';
        this.list = await this.getItems();
        this.openError();
      } else {
        this.Message = 'Failed to remove item';
        this.openError();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }
}

export class Item {
  _id!: number ;
  name!: string;
  date: Date | undefined;
  price!: number;
  description!: string;
  image!: string;
  hovered: boolean;
  constructor() {
    this.hovered = true;
  }
}
