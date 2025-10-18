import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalData | null>(null);
  public modal$ = this.modalSubject.asObservable();

  showModal(data: ModalData): Observable<boolean> {
    return new Observable(observer => {
      this.modalSubject.next(data);
      
      // Store the observer to be called when user responds
      (this as any).currentObserver = observer;
    });
  }

  confirm(): void {
    if ((this as any).currentObserver) {
      (this as any).currentObserver.next(true);
      (this as any).currentObserver.complete();
      (this as any).currentObserver = null;
    }
    this.closeModal();
  }

  cancel(): void {
    if ((this as any).currentObserver) {
      (this as any).currentObserver.next(false);
      (this as any).currentObserver.complete();
      (this as any).currentObserver = null;
    }
    this.closeModal();
  }

  closeModal(): void {
    this.modalSubject.next(null);
  }

  // Convenience methods
  showSuccess(title: string, message: string): Observable<boolean> {
    return this.showModal({
      title,
      message,
      type: 'success',
      showCancel: false,
      confirmText: 'OK'
    });
  }

  showError(title: string, message: string): Observable<boolean> {
    return this.showModal({
      title,
      message,
      type: 'error',
      showCancel: false,
      confirmText: 'OK'
    });
  }

  showConfirm(title: string, message: string): Observable<boolean> {
    return this.showModal({
      title,
      message,
      type: 'warning',
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No'
    });
  }
}
