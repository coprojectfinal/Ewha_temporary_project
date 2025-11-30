package project.final_project.dto;

import java.util.List;
import java.util.Map;

public class CompareRequest {private List<String> selectedProducts;
    private Map<String, String> userStandard;

    // getters & setters
    public List<String> getSelectedProducts() { return selectedProducts; }
    public void setSelectedProducts(List<String> selectedProducts) { this.selectedProducts = selectedProducts; }

    public Map<String, String> getUserStandard() { return userStandard; }
    public void setUserStandard(Map<String, String> userStandard) { this.userStandard = userStandard; }
    
}
