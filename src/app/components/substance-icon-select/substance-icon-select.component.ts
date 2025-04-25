import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { SubstanceIcon } from "../../dto/substance.dto";
import { FontAwesomeModule, IconDefinition } from "@fortawesome/angular-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { CommonModule } from "@angular/common";

console.log("Chegou no SubanceIconSelectComponent");

@Component({
    selector: "app-substance-icon-select",
    imports: [FontAwesomeModule, SelectModule, CommonModule],
    templateUrl: "./substance-icon-select.component.html",
    /** To work with ngModel, this component needs to declare itself as a provider for NG_VALUE_ACESSOR */
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        multi: true,
        useExisting: forwardRef(() => SubstanceIconSelectComponent),
    }]
})
export class SubstanceIconSelectComponent implements ControlValueAccessor {
    protected icons = Object.keys(SubstanceIcon);
    protected names: string[] = Object.keys(SubstanceIcon);
    
    protected onChange: (value: any) => void;
    protected onTouched: () => void;
    protected value: any;

    @Input() colorClass = "";

    constructor() {
        const iconList = Object.keys(SubstanceIcon);
        // iconList.forEach((icon) => {
        //     const iconName = SubstanceIcon[icon as keyof typeof SubstanceIcon];
        //     this.icons.set(iconName, icon);//SubstanceIcon[icon as keyof typeof SubstanceIcon]);
        // });
    }

    getIcon(key: string) {
        const icon = SubstanceIcon[key as keyof typeof SubstanceIcon];
        return icon;
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
