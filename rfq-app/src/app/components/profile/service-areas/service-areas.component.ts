import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { GoogleMapsApi } from '../../../models/rfq.model';
import { User } from '../../../models/user.model';
import { Auth } from '../../../services/auth';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AlertService } from '../../../services/alert.service';

declare var google: GoogleMapsApi;
@Component({
  selector: 'app-service-areas',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './service-areas.component.html',
  styleUrl: './service-areas.component.scss'
})
export class ServiceAreasComponent implements OnInit {
  @ViewChild('locationInput') locationInput!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Output() serviceAreaChange = new EventEmitter<{
    streetAddress: string;
    latitude: number;
    longitude: number;
    radius: number;
  }>();

  selectedLocation: string = '';
  rangeMiles: number = 0;

  private map: any;
  private autocomplete: any;
  private marker: any;
  private circle: any;
  selectedPlaceDetails: any = null;
  private isMapInitialized: boolean = false;
  private isGoogleMapsLoaded: boolean = false;

  StreetAddress: string = '';
  LatitudeAddress: number = 0;
  LongitudeAddress: number = 0;
  OperatingRadius: number = 0;
  currentUser: User | null = null;
  isSubmitting: boolean = false;
  coordinatesChanged: boolean = false;

  private originalData: {
    streetAddress: string;
    latitude: number;
    longitude: number;
    radius: number;
  } | null = null;

  private destroy$ = new Subject<void>();

  DEFAULT_LOCATION = {
    lat: 41.9981,
    lng: 21.4254
  };

  constructor(
    private ngZone: NgZone,
    private _authService: Auth,
    private _alertService: AlertService
  ) {}

ngOnInit(): void {
  this.loadGoogleMaps();
  this._authService.currentUserSubject
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      this.currentUser = user ?? null;

      if (this.isMapInitialized && this.currentUser?.companyDetails) {
        const { latitudeAddress, longitudeAddress } = this.currentUser.companyDetails;
        const center = {
          lat: latitudeAddress ??this. DEFAULT_LOCATION.lat,
          lng: longitudeAddress ?? this.DEFAULT_LOCATION.lng
        };
        this.map.setCenter(center);
        this.marker?.setPosition(center);
        this.circle?.setCenter(center);
      }
    },
    error => {
      this._alertService.error('SERVICE_AREA.RETRIEVE_USER_FAILED');
      this.currentUser = null;
    });
}


  ngAfterViewInit(): void {
    if (this.isGoogleMapsLoaded && !this.isMapInitialized) {
      setTimeout(() => this.initializeMap(), 0);
    }
    this.initializeOriginalData();
  }

  ngOnDestroy(): void {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
    }
    this.isMapInitialized = false;
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadGoogleMaps() {
    if (typeof google !== 'undefined') {
      this.isGoogleMapsLoaded = true;
      if (this.mapContainer?.nativeElement && this.locationInput?.nativeElement) {
        this.initializeMap();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.isGoogleMapsLoaded = true;
      if (this.mapContainer?.nativeElement && this.locationInput?.nativeElement) {
        this.initializeMap();
      }
    };
    document.head.appendChild(script);
  }

  private initializeMap() {
    if (this.isMapInitialized) {
      return;
    }

    if (!this.mapContainer?.nativeElement || !this.locationInput?.nativeElement) {
      return;
    }

    if (typeof google === 'undefined') {
      return;
    }

    try {
      const address = this.currentUser?.companyDetails?.streetAddress || '';
      this.selectedLocation = address;
      this.rangeMiles = this.currentUser?.companyDetails?.operatingRadius || 10;
      const defaultLocation = {
        lat: this.currentUser?.companyDetails?.latitudeAddress || 41.9981,
        lng: this.currentUser?.companyDetails?.longitudeAddress || 21.4254
      };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: defaultLocation,
        zoom: 10,
      });

      this.autocomplete = new google.maps.places.Autocomplete(
        this.locationInput.nativeElement,
        {
          types: ['geocode'],
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
        }
      );

      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          this.onPlaceSelected();
        });
      });

      this.marker = new google.maps.Marker({
        map: this.map,
        position: defaultLocation
      });

      this.circle = new google.maps.Circle({
        map: this.map,
        center: defaultLocation,
        radius: this.rangeMiles * 1609.34,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.3,
        strokeWeight: 2
      });

      this.isMapInitialized = true;
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      this.isMapInitialized = false;
    }
  }

  private reinitializeMapIfNeeded() {
    if (!this.isMapInitialized && this.isGoogleMapsLoaded) {
      this.initializeMap();
    }
  }

  onTabFocus() {
    setTimeout(() => {
      this.reinitializeMapIfNeeded();
    }, 100);
  }

  private onPlaceSelected() {
    const place = this.autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      console.log('No location data available for this place');
      return;
    }

    this.selectedPlaceDetails = place;
    this.selectedLocation = place.formatted_address || place.name;

    const location = place.geometry.location;

    if (this.map) {
      this.map.setCenter(location);
      this.map.setZoom(12);
    }

    if (this.marker) {
      this.marker.setPosition(location);
    }

    if (this.circle) {
      this.circle.setCenter(location);
      this.circle.setRadius(this.rangeMiles * 1609.34);
    }

    this.emitServiceAreaData();

    this.coordinatesChanged = this.hasDataChanged();
  }

  onRangeChange() {
    if (this.circle && this.rangeMiles) {
      const radiusInMeters = this.rangeMiles * 1609.34;
      this.circle.setRadius(radiusInMeters);
      const bounds = this.circle.getBounds();
      if (bounds) {
        this.map.fitBounds(bounds);
      }
    }
  }

  getCurrentLocation(): any {
    return this.selectedPlaceDetails;
  }

  getCurrentRange(): number {
    return this.rangeMiles;
  }

  getLocationCoordinates(): { lat: number, lng: number } | null {
    if (this.selectedPlaceDetails?.geometry?.location) {
      return {
        lat: this.selectedPlaceDetails.geometry.location.lat(),
        lng: this.selectedPlaceDetails.geometry.location.lng()
      };
    }
    return null;
  }

  emitServiceAreaData() {
    this.StreetAddress = this.selectedPlaceDetails.formatted_address;
    this.LatitudeAddress = this.selectedPlaceDetails.geometry.location.lat();
    this.LongitudeAddress = this.selectedPlaceDetails.geometry.location.lng();
    this.OperatingRadius = this.rangeMiles;
    this.coordinatesChanged = true;

    this.serviceAreaChange.emit({
      streetAddress: this.StreetAddress,
      latitude: this.LatitudeAddress,
      longitude: this.LongitudeAddress,
      radius: this.OperatingRadius,
    });
  }

  shouldShowSaveButton(): boolean {
    return this.coordinatesChanged && this.selectedPlaceDetails && this.rangeMiles > 0;
  }

  isValidData(): boolean {
    return !!(
      this.selectedPlaceDetails?.formatted_address &&
      this.selectedPlaceDetails?.geometry?.location &&
      this.rangeMiles &&
      this.rangeMiles > 0 &&
      this.rangeMiles <= 1000
    );
  }

  getSaveButtonClasses(): string {
    const baseClasses = 'px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    if (!this.isValidData() || this.isSubmitting) {
      return `${baseClasses} bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed`;
    }

    return `${baseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5`;
  }

  saveServiceArea(): void {
    if (!this.isValidData() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const companyDetails = {
      ...this.currentUser?.companyDetails,
      streetAddress: this.StreetAddress,
      latitudeAddress: this.LatitudeAddress,
      longitudeAddress: this.LongitudeAddress,
      operatingRadius: this.rangeMiles,
    };

    const formData = this.buildFormData(this.currentUser, companyDetails);

    this._authService
      .updateUserProfile(formData)
      .pipe(
        finalize(() => (this.isSubmitting = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this._alertService.success('SERVICE_AREA.SERVICE_AREA_UPDATED_SUCCESS'),
        error: (err) => {
          if (err.status === 0) {
            this._alertService.error('SERVICE_AREA.SERVICE_AREA_UPDATE_NETWORK_ERROR');
          } else {
            this._alertService.error('SERVICE_AREA.SERVICE_AREA_UPDATE_FAILED');
          }
        },
      });
  }

  buildFormData(user: User | null, overrides?: Partial<User["companyDetails"]>): FormData {
    if (!user) {
      return new FormData();
    }

    const formData = new FormData();

    formData.append("UserId", user.id.toString());
    formData.append("Email", user.email ?? "");
    formData.append("FirstName", user.firstName ?? "");
    formData.append("LastName", user.lastName ?? "");
    formData.append("PhoneNumber", user.phoneNumber ?? "");

    user.categories?.forEach((cat, index) => {
      formData.append(`CategoriesIds[${index}]`, cat.id.toString());
    });

    user.subcategories?.forEach((sub, index) => {
      formData.append(`SubCategoriesIds[${index}]`, sub.id.toString());
    });

    const cd = { ...user.companyDetails, ...overrides };

    formData.append("CompanyDetails.Name", cd?.name ?? "");
    formData.append("CompanyDetails.ContactPersonFirstName", cd?.contactPersonFirstName ?? "");
    formData.append("CompanyDetails.ContactPersonLastName", cd?.contactPersonLastName ?? "");
    formData.append("CompanyDetails.ContactPersonEmail", cd?.contactPersonEmail ?? "");
    formData.append("CompanyDetails.ContactPersonPhone", cd?.contactPersonPhone ?? "");
    formData.append("CompanyDetails.Description", cd?.description ?? "");
    formData.append("CompanyDetails.StreetAddress", cd?.streetAddress ?? "");
    formData.append("CompanyDetails.LatitudeAddress", cd?.latitudeAddress?.toString() ?? "");
    formData.append("CompanyDetails.LongitudeAddress", cd?.longitudeAddress?.toString() ?? "");
    formData.append("CompanyDetails.OperatingRadius", (this.rangeMiles ?? 0).toString());
    formData.append("CompanyDetails.CompanySize", cd?.companySize?.id?.toString() ?? "");

    if (cd.certificate) {
      formData.append("CompanyDetails.Certificate", JSON.stringify(cd.certificate));
    }

    return formData;
  }

  private initializeOriginalData(): void {
    if (this.currentUser?.companyDetails) {
      this.originalData = {
        streetAddress: this.currentUser.companyDetails.streetAddress || '',
        latitude: this.currentUser.companyDetails.latitudeAddress || 0,
        longitude: this.currentUser.companyDetails.longitudeAddress || 0,
        radius: this.currentUser.companyDetails.operatingRadius || 0
      };
    }
  }

  private hasDataChanged(): boolean {
    if (!this.originalData || !this.selectedPlaceDetails) {
      return !!this.selectedPlaceDetails;
    }

    return (
      this.StreetAddress !== this.originalData.streetAddress ||
      this.LatitudeAddress !== this.originalData.latitude ||
      this.LongitudeAddress !== this.originalData.longitude ||
      this.rangeMiles !== this.originalData.radius
    );
  }
}