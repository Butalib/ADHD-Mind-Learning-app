import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StudyTopicsService, StudyTopic, TopicFilter } from '../../services/study-topics.service';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-learning',
  templateUrl: './learning.page.html',
  styleUrls: ['./learning.page.scss'],
  standalone: false,
})
export class LearningPage implements OnInit, OnDestroy {
  // Navigation State
  selectedTopic: StudyTopic | null = null;
  currentFilteredList: StudyTopic[] = [];

  // Hardware back button subscription
  private backButtonSub: Subscription | null = null;
  
  // Modal State for Add/Edit
  isModalOpen: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  editingTopicId: string | null = null;

  // Form Fields
  formTitle: string = '';
  formCategory: string = 'عام';
  formReadingTime: string = '3 دقائق';
  formSummary: string = '';
  formContent: string = '';
  formColor: string = '#38bdf8';

  availableColors: string[] = ['#38bdf8', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#6366f1'];

  // Current Filter
  activeFilter: TopicFilter = 'all';
  searchQuery: string = '';

  // Observables
  filteredTopics$!: Observable<StudyTopic[]>;
  allCount$!: Observable<number>;
  pendingCount$!: Observable<number>;
  completedCount$!: Observable<number>;

  constructor(
    public topicsService: StudyTopicsService,
    private platform: Platform
  ) {}

  ngOnInit(): void {
    this.allCount$ = this.topicsService.topics$.pipe(
      map((list) => list.length)
    );

    this.pendingCount$ = this.topicsService.topics$.pipe(
      map((list) => list.filter((t) => !t.completed).length)
    );

    this.completedCount$ = this.topicsService.topics$.pipe(
      map((list) => list.filter((t) => t.completed).length)
    );

    this.filteredTopics$ = combineLatest([
      this.topicsService.topics$,
      this.topicsService.filter$,
    ]).pipe(
      map(([topics, filter]) => {
        let result = topics;

        if (filter === 'pending') {
          result = result.filter((t) => !t.completed);
        } else if (filter === 'completed') {
          result = result.filter((t) => t.completed);
        }

        if (this.searchQuery && this.searchQuery.trim() !== '') {
          const q = this.searchQuery.toLowerCase().trim();
          result = result.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.category.toLowerCase().includes(q) ||
              t.summary.toLowerCase().includes(q)
          );
        }

        return result;
      }),
      tap((list) => {
        this.currentFilteredList = list;
      })
    );

    // Register hardware/swipe back button listener for Android & mobile navigation
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.isModalOpen) {
        this.closeModal();
      } else if (this.selectedTopic) {
        this.goBack();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
      this.backButtonSub = null;
    }
  }

  // Filter actions
  setFilter(filter: TopicFilter): void {
    this.activeFilter = filter;
    this.topicsService.setFilter(filter);
  }

  onSearchChange(event: any): void {
    this.searchQuery = event.detail.value || '';
    this.topicsService.setFilter(this.activeFilter);
  }

  // Pull-to-refresh Handler
  async handleRefresh(event: any): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await this.topicsService.refreshTopics();
    } catch (err) {
      console.warn('Error during pull-to-refresh:', err);
    } finally {
      event.target.complete();
    }
  }

  // Navigation
  openDetails(topic: StudyTopic): void {
    this.selectedTopic = topic;
  }

  goBack(): void {
    this.selectedTopic = null;
  }

  // Study Navigation (Next / Previous)
  get currentTopicIndex(): number {
    if (!this.selectedTopic) return -1;
    return this.currentFilteredList.findIndex((t) => t.id === this.selectedTopic!.id);
  }

  get hasPreviousTopic(): boolean {
    return this.currentTopicIndex > 0;
  }

  get hasNextTopic(): boolean {
    const idx = this.currentTopicIndex;
    return idx >= 0 && idx < this.currentFilteredList.length - 1;
  }

  goToPreviousTopic(): void {
    const idx = this.currentTopicIndex;
    if (idx > 0) {
      this.selectedTopic = this.currentFilteredList[idx - 1];
    }
  }

  goToNextTopic(): void {
    const idx = this.currentTopicIndex;
    if (idx >= 0 && idx < this.currentFilteredList.length - 1) {
      this.selectedTopic = this.currentFilteredList[idx + 1];
    }
  }

  // Checkbox toggle
  toggleCompletion(event: Event, topic: StudyTopic): void {
    event.stopPropagation();
    this.topicsService.toggleCompletion(topic.id);
    if (this.selectedTopic && this.selectedTopic.id === topic.id) {
      this.selectedTopic = this.topicsService.getTopicById(topic.id) || null;
    }
  }

  // Delete action
  deleteTopic(event: Event, topic: StudyTopic): void {
    event.stopPropagation();
    const confirmed = confirm(`هل أنت متأكد من حذف الموضوع: "${topic.title}"؟`);
    if (confirmed) {
      this.topicsService.deleteTopic(topic.id);
      if (this.selectedTopic && this.selectedTopic.id === topic.id) {
        this.selectedTopic = null;
      }
    }
  }

  // Modal open for Create
  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingTopicId = null;
    this.formTitle = '';
    this.formCategory = 'مذاكرة وتركيز';
    this.formReadingTime = '5 دقائق';
    this.formSummary = '';
    this.formContent = '';
    this.formColor = '#38bdf8';
    this.isModalOpen = true;
  }

  // Modal open for Edit
  openEditModal(event: Event, topic: StudyTopic): void {
    event.stopPropagation();
    this.modalMode = 'edit';
    this.editingTopicId = topic.id;
    this.formTitle = topic.title;
    this.formCategory = topic.category;
    this.formReadingTime = topic.readingTime;
    this.formSummary = topic.summary;
    this.formContent = topic.content;
    this.formColor = topic.accentColor || '#38bdf8';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveTopic(): void {
    if (!this.formTitle.trim()) {
      alert('يرجى كتابة عنوان للموضوع');
      return;
    }

    if (this.modalMode === 'create') {
      const created = this.topicsService.addTopic({
        title: this.formTitle.trim(),
        category: this.formCategory.trim() || 'عام',
        readingTime: this.formReadingTime.trim() || '3 دقائق',
        summary: this.formSummary.trim(),
        content: this.formContent.trim(),
        accentColor: this.formColor,
        completed: false,
      });
      this.selectedTopic = created;
    } else if (this.modalMode === 'edit' && this.editingTopicId) {
      this.topicsService.updateTopic(this.editingTopicId, {
        title: this.formTitle.trim(),
        category: this.formCategory.trim() || 'عام',
        readingTime: this.formReadingTime.trim() || '3 دقائق',
        summary: this.formSummary.trim(),
        content: this.formContent.trim(),
        accentColor: this.formColor,
      });

      if (this.selectedTopic && this.selectedTopic.id === this.editingTopicId) {
        this.selectedTopic = this.topicsService.getTopicById(this.editingTopicId) || null;
      }
    }

    this.isModalOpen = false;
  }
}
