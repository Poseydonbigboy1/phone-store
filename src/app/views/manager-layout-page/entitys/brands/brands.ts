import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Brand } from '@models/data';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BrandService } from './brands.service';

@Component({
  selector: 'app-brands',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DrawerModule,
    PaginatorModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ToolbarModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
  standalone: true,
  providers: [ConfirmationService, MessageService],
})
export class Brands implements OnInit {
  brands: Brand[] = [];
  totalRecords: number = 0;
  paginatorState: PaginatorState = { first: 0, rows: 10, page: 0, pageCount: 0 };
  loading: boolean = false;

  // Sidebar Forms
  displayForm: boolean = false;
  brandForm: FormGroup;
  isEditMode: boolean = false;
  selectedBrandId: string | null = null;

  // Sidebar Filters
  displayFilter: boolean = false;
  filterForm: FormGroup;
  appliedFilters: { key: string; value: string }[] = [];

  constructor(
    private brandService: BrandService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.brandForm = this.fb.group({
      title: ['', Validators.required],
    });
    this.filterForm = this.fb.group({
      title: [''],
    });
  }

  ngOnInit(): void {
    this.loadBrands();
  }

  onPageChange(event: PaginatorState): void {
    this.paginatorState = event;
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading = true;
    const filterValue = { title: this.filterForm.value.title };
    this.brandService.getBrands(this.paginatorState, filterValue).subscribe((response) => {
      this.brands = response.items;
      this.totalRecords = response.total;
      this.loading = false;
    });
  }

  showAddForm(): void {
    this.isEditMode = false;
    this.brandForm.reset();
    this.displayForm = true;
  }

  showEditForm(brand: Brand): void {
    this.isEditMode = true;
    this.selectedBrandId = brand.id;
    this.brandForm.patchValue({ title: brand.title });
    this.displayForm = true;
  }

  onFormSubmit(): void {
    if (this.brandForm.invalid) {
      return;
    }

    const title = this.brandForm.value.title;
    const operation$ = this.isEditMode
      ? this.brandService.updateBrand(this.selectedBrandId!, title)
      : this.brandService.addBrand(title);

    operation$.subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Brand ${this.isEditMode ? 'updated' : 'added'} successfully.`,
      });
      this.displayForm = false;
      this.loadBrands();
    });
  }

  deleteBrand(id: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this brand?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.brandService.deleteBrand(id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Brand deleted successfully.',
          });
          this.loadBrands();
        });
      },
    });
  }

  // Filter methods
  applyFilters(): void {
    this.appliedFilters = [];
    const title = this.filterForm.get('title')?.value;
    if (title) {
      this.appliedFilters.push({ key: 'title', value: title });
    }
    this.displayFilter = false;
    this.paginatorState = { ...this.paginatorState, first: 0, page: 0 };
    this.loadBrands();
  }

  removeFilter(key: string): void {
    this.filterForm.get(key)?.reset();
    this.applyFilters();
  }
}
