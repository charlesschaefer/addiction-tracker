import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { SubstanceIcon } from "../../dto/substance.dto";
import { CommonModule } from "@angular/common";

console.log("Chegou no SubanceIconSelectComponent");

@Component({
    selector: "app-substance-icon-select",
    imports: [SelectModule, CommonModule],
    templateUrl: "./substance-icon-select.component.html",
    /** To work with ngModel, this component needs to declare itself as a provider for NG_VALUE_ACESSOR */
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        multi: true,
        useExisting: forwardRef(() => SubstanceIconSelectComponent),
    }]
})
export class SubstanceIconSelectComponent implements ControlValueAccessor, OnInit {
    protected icons = Object.keys(SubstanceIcon);
    protected names: string[] = Object.keys(SubstanceIcon);
    
    protected onChange: (value: any) => void;
    protected onTouched: () => void;
    protected value: any;

    @Input() colorClass = "";
    @Input() currentIcon: SubstanceIcon | null = null;

    constructor() {
        //const iconList = Object.keys(SubstanceIcon);
        // iconList.forEach((icon) => {
        //     const iconName = SubstanceIcon[icon as keyof typeof SubstanceIcon];
        //     this.icons.set(iconName, icon);//SubstanceIcon[icon as keyof typeof SubstanceIcon]);
        // });
    }

    ngOnInit() {
        // If no value is set but we have a currentIcon, use it as the initial value
        if (!this.value && this.currentIcon) {
            this.value = this.currentIcon;
            if (this.onChange) {
                this.onChange(this.currentIcon);
            }
        }
    }

    getIcon(key: string) {
        const icon = SubstanceIcon[key as keyof typeof SubstanceIcon];
        return icon;
    }

    getIconClasses(icon: string): string {
        const isSelected = this.value === icon || (this.currentIcon && this.currentIcon === icon && !this.value);
        const baseClasses = 'hover:bg-purple-300 dark:hover:bg-purple-700 p-2 rounded-lg transition-all duration-200 cursor-pointer';
        
        if (isSelected) {
            return `${baseClasses} bg-purple-200 dark:bg-purple-800 ring-2 ring-purple-500 dark:ring-purple-400 ${this.colorClass}`;
        } else {
            return `${baseClasses} bg-gray-100 dark:bg-gray-700 ${this.colorClass}`;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    
    writeValue(obj: any): void {
        this.value = obj;
    }
    
    onInputChange(value: any): void {
        this.value = value;
        this.onChange(value);
        this.onTouched();
    }
}
