/*
 * Copyright 2019 European Commission
 *
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 *     https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and limitations under the Licence.
 */
package eu.europa.ec.leos.vo.toctype;

public enum AnnexTocItemType implements TocItemType {

    PREFACE("preface", true, false, false, true, false, false, true, false, false, false, false, true),
    BODY("mainBody", true, false, true, true, false, false, true, false, false, false, false, true),
    PART("part", false, true, true, true, true, true, true, true, false, true, true, true),
    TITLE("title", false, true, true, true, true, true, true, true, false, true, true, true),
    CHAPTER("chapter", false, true, true, true, true, true, true, true, false, true, true, true),
    SECTION("section", false, true, true, true, true, true, true, true, false, true, true, true),
    DIVISION("division", false, true, false, true, false, false, false, false, true, true, false, true);

    protected String name;
    protected boolean isRoot;
    protected boolean draggable;
    protected boolean toBeDisplayed;
    protected boolean hasItemNumber;
    protected boolean hasItemHeading;
    protected boolean childrenAllowed;
    protected boolean hasItemDescription;
    protected boolean isNumberEditable;
    protected boolean isContentDisplayed;
    protected boolean isDeletable;
    protected boolean hasNumWithType;
    protected boolean isExpandedByDefault;
    
    protected boolean isSameParentAsChild;
    
    AnnexTocItemType(String name, boolean isRoot, boolean draggable, boolean childrenAllowed, boolean toBeDisplayed, boolean hasItemNumber, 
            boolean hasItemHeading, boolean hasItemDescription, boolean isNumberEditable, boolean isContentDisplayed, boolean isDeletable, boolean hasNumWithType,
            boolean isExpandedByDefault) {
        this.name = name;
        this.isRoot = isRoot;
        this.draggable = draggable;
        this.childrenAllowed = childrenAllowed;
        this.toBeDisplayed = toBeDisplayed;
        this.hasItemNumber = hasItemNumber;
        this.hasItemHeading = hasItemHeading;
        this.hasItemDescription = hasItemDescription;
        this.isNumberEditable = isNumberEditable;
        this.isContentDisplayed = isContentDisplayed;
        this.isDeletable = isDeletable;
        this.hasNumWithType = hasNumWithType;
        this.isExpandedByDefault = isExpandedByDefault;
        
        this.isSameParentAsChild = false;
    }

    @Override
    public boolean isRoot() {
        return isRoot;
    }

    @Override
    public boolean isDraggable() {
        return draggable;
    }

    @Override
    public boolean isToBeDisplayed() {
        return toBeDisplayed;
    }

    @Override
    public boolean hasItemNumber() {
        return hasItemNumber;
    }
    
    @Override
    public boolean hasItemHeading() {
        return hasItemHeading;
    }
    
    @Override
    public String getName() {
        return name;
    }

    @Override
    public void setName(String name) {
        this.name = name;
    }
    
    @Override
    public boolean areChildrenAllowed() {
        return childrenAllowed;
    }
    
    public static TocItemType fromName(String name) {
        for (TocItemType type : AnnexTocItemType.values()) {
            if (type.getName().equalsIgnoreCase(name)) {
                return type;
            }
        }
        return null;
    }

    @Override
    public String getNumHeadingSeparator() {
        return NUM_HEADING_SEPARATOR;
    }

    @Override
    public String getContentSeparator() {
        return CONTENT_SEPARATOR;
    }
    
    @Override
    public boolean hasItemDescription() {
        return hasItemDescription;
    }

    @Override
    public boolean isNumberEditable() {
        return isNumberEditable;
    }

    @Override
    public boolean isContentDisplayed() {
        return isContentDisplayed;
    }

    @Override
    public boolean isDeletable() {
        return isDeletable;
    }
    
    @Override
    public boolean hasNumWithType() {
        return hasNumWithType;
    }

    @Override
    public boolean isExpandedByDefault() {
        return isExpandedByDefault;
    }

    @Override
    public boolean isSameParentAsChild() {
        return isSameParentAsChild;
    }
}
