import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService, ModalData } from './modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  modalData: ModalData | null = null;
  private destroy$ = new Subject<void>();

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.modal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.modalData = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirm(): void {
    this.modalService.confirm();
  }

  cancel(): void {
    this.modalService.cancel();
  }

  close(): void {
    this.modalService.closeModal();
  }

  getIconClass(): string {
    if (!this.modalData) return '';
    
    switch (this.modalData.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getIconColor(): string {
    if (!this.modalData) return '';
    
    switch (this.modalData.type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#2196f3';
    }
  }
}
